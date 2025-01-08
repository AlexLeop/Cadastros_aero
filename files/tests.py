from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import File
from .tasks import process_file

User = get_user_model()

class FileModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.file = File.objects.create(
            file=SimpleUploadedFile("test.csv", b"file_content"),
            original_name="test.csv",
            file_type=".csv",
            uploaded_by=self.user
        )

    def test_file_creation(self):
        self.assertEqual(self.file.status, 'pending')
        self.assertEqual(self.file.uploaded_by, self.user)

class FileAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
    def test_file_upload(self):
        file_content = b"name,age\njohn,30\nmary,25"
        file = SimpleUploadedFile("test.csv", file_content)
        
        response = self.client.post('/api/files/', {
            'file': file,
            'original_name': 'test.csv',
            'file_type': '.csv'
        }, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(File.objects.count(), 1) 