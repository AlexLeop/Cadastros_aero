from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Record
from files.models import File
from .tasks import validate_record

User = get_user_model()

class RecordModelTest(TestCase):
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
        
        self.record = Record.objects.create(
            file=self.file,
            row_number=1,
            data={'name': 'John', 'cpf': '123.456.789-00'},
            created_by=self.user
        )

    def test_record_validation(self):
        validate_record(self.record.id)
        self.record.refresh_from_db()
        self.assertEqual(self.record.status, 'error')  # CPF inválido

class RecordAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
    def test_record_list(self):
        response = self.client.get('/api/records/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_record_export(self):
        response = self.client.post('/api/records/export/', {
            'format': 'csv'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK) 