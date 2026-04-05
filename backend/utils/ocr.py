"""
OCR and image processing utilities.
"""
import os
import time
import logging
from PIL import Image
import pytesseract
import numpy as np
from django.conf import settings

logger = logging.getLogger(__name__)


def extract_text_from_image(image_path):
    """
    Extract text from image using Tesseract OCR.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        dict: {
            'raw_text': extracted text,
            'confidence': confidence score (0-100),
            'processing_time': time taken in seconds
        }
    """
    try:
        start_time = time.time()
        
        # Set tesseract path if configured
        if hasattr(settings, 'TESSERACT_CMD'):
            pytesseract.pytesseract.pytesseract_cmd = settings.TESSERACT_CMD
        
        # Open image
        image = Image.open(image_path)
        
        # Extract text
        raw_text = pytesseract.image_to_string(image, lang='eng')
        
        # Get configuration data for confidence
        config_data = pytesseract.image_to_data(image, output_type='dict')
        
        # Calculate average confidence
        confidences = [int(conf) for conf in config_data['confidence'] if int(conf) >= 0]
        confidence = sum(confidences) / len(confidences) if confidences else 0
        
        processing_time = time.time() - start_time
        
        logger.info(f"Successfully extracted text from {image_path}")
        
        return {
            'raw_text': raw_text,
            'confidence': confidence,
            'processing_time': processing_time
        }
    
    except Exception as e:
        logger.error(f"Error extracting text from image: {str(e)}")
        raise


def preprocess_image(image_path):
    """
    Preprocess image to improve OCR accuracy.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        PIL.Image: Processed image
    """
    try:
        image = Image.open(image_path)
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize if too small
        if image.width < 200 or image.height < 200:
            scale = max(200 / image.width, 200 / image.height)
            new_size = (int(image.width * scale), int(image.height * scale))
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        # Convert to grayscale
        image = image.convert('L')
        
        # Increase contrast
        from PIL import ImageEnhance
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(2)
        
        return image
    
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        raise


def parse_tasks_from_text(raw_text):
    """
    Parse tasks from OCR extracted text using NLP/pattern matching.
    
    Args:
        raw_text: Raw text extracted from image
        
    Returns:
        list: List of parsed tasks
    """
    import re
    from datetime import datetime, timedelta
    
    tasks = []
    
    # Split by common delimiters
    lines = raw_text.split('\n')
    
    # Time patterns
    time_pattern = r'\b(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?\b'
    client_pattern = r'(?:Client|Contact|Visit to|Meet)\s*:?\s*([A-Za-z\s]+)'
    location_pattern = r'(?:Location|Address|Place)\s*:?\s*([^,\n]+)'
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line or len(line) < 3:
            continue
        
        task = {}
        
        # Extract time
        time_match = re.search(time_pattern, line)
        if time_match:
            task['time'] = time_match.group(0)
        
        # Extract client name
        client_match = re.search(client_pattern, line, re.IGNORECASE)
        if client_match:
            task['client_name'] = client_match.group(1).strip()
        else:
            # Try to extract from current line
            task['client_name'] = line.split(',')[0] if ',' in line else line[:50]
        
        # Extract location
        location_match = re.search(location_pattern, line, re.IGNORECASE)
        if location_match:
            task['location'] = location_match.group(1).strip()
        elif ',' in line:
            task['location'] = line.split(',')[-1].strip()
        
        # Ensure we have minimum data
        if task.get('client_name'):
            task['title'] = f"Visit {task.get('client_name', 'Client')}"
            task['description'] = line
            tasks.append(task)
    
    return tasks


def generate_task_suggestions(raw_text):
    """
    Use NLP to generate task suggestions from raw text.
    
    Args:
        raw_text: Raw text extracted from image
        
    Returns:
        list: List of suggested tasks with confidence scores
    """
    suggestions = []
    
    try:
        # Simple keyword-based suggestion
        keywords = {
            'follow_up': ['follow', 'callback', 'contact', 'reach'],
            'presentation': ['present', 'demo', 'show', 'display'],
            'meeting': ['meet', 'meeting', 'appointment', 'discuss'],
            'delivery': ['deliver', 'pickup', 'collect', 'send'],
        }
        
        text_lower = raw_text.lower()
        
        for task_type, keywords_list in keywords.items():
            count = sum(text_lower.count(kw) for kw in keywords_list)
            if count > 0:
                suggestions.append({
                    'type': task_type,
                    'count': count,
                    'confidence': min(count * 10, 100)
                })
        
        # Sort by confidence
        suggestions.sort(key=lambda x: x['confidence'], reverse=True)
        
    except Exception as e:
        logger.error(f"Error generating suggestions: {str(e)}")
    
    return suggestions
