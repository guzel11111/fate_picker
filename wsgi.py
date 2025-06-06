"""
WSGI config for fate_picker project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fate_picker.settings')

application = get_wsgi_application() 