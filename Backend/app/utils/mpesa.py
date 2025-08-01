import random
import string
import re

def generate_mpesa_code(length=10):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def allowed_file_extension(ext):
    return ext.lower() in ALLOWED_EXTENSIONS

def convert_google_drive_link(url):
    """
    Converts Google Drive share URL to a direct download link.
    Example input: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    Output: https://drive.google.com/uc?export=download&id=FILE_ID
    """
    match = re.search(r'/d/([^/]+)', url)
    if match:
        file_id = match.group(1)
        return f"https://drive.google.com/uc?export=download&id={file_id}"
    return url  # fallback if not Google Drive format
