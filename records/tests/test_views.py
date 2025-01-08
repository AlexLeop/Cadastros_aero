import pytest
from django.urls import reverse
from records.models import Record
from mixer.backend.django import mixer

pytestmark = pytest.mark.django_db

class TestRecordViewSet:
    def test_list_records(self, auth_client):
        client, user = auth_client
        mixer.cycle(3).blend(Record, created_by=user)
        
        url = reverse('record-list')
        response = client.get(url)
        
        assert response.status_code == 200
        assert len(response.data['results']) == 3

    def test_create_record(self, auth_client, mock_celery):
        client, user = auth_client
        file = mixer.blend('files.File', uploaded_by=user)
        data = {
            'file': file.id,
            'row_number': 1,
            'data': {'name': 'Test', 'value': 123}
        }
        
        url = reverse('record-list')
        response = client.post(url, data, format='json')
        
        assert response.status_code == 201
        assert Record.objects.count() == 1
        assert mock_celery.called

    @pytest.mark.parametrize('status,count', [
        ('pending', 2),
        ('validated', 1),
        ('error', 1),
    ])
    def test_filter_by_status(self, auth_client, status, count):
        client, user = auth_client
        mixer.cycle(2).blend(Record, created_by=user, status='pending')
        mixer.blend(Record, created_by=user, status='validated')
        mixer.blend(Record, created_by=user, status='error')
        
        url = reverse('record-list')
        response = client.get(url, {'status': status})
        
        assert response.status_code == 200
        assert len(response.data['results']) == count

    def test_statistics(self, auth_client):
        client, user = auth_client
        mixer.cycle(2).blend(Record, created_by=user, status='pending')
        mixer.blend(Record, created_by=user, status='validated')
        
        url = reverse('record-statistics')
        response = client.get(url)
        
        assert response.status_code == 200
        assert response.data['total_records'] == 3
        assert len(response.data['by_status']) == 2 