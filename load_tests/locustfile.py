from locust import HttpUser, task, between
from faker import Faker

fake = Faker()

class RecordsUser(HttpUser):
    wait_time = between(1, 3)
    token = None

    def on_start(self):
        # Login
        response = self.client.post("/api/auth/token/", {
            "email": "test@example.com",
            "password": "test123"
        })
        self.token = response.json()["access"]
        self.client.headers = {"Authorization": f"Bearer {self.token}"}

    @task(3)
    def list_records(self):
        self.client.get("/api/records/")

    @task(2)
    def search_records(self):
        self.client.get(f"/api/records/?search={fake.word()}")

    @task(1)
    def create_record(self):
        self.client.post("/api/records/", {
            "data": {
                "field1": fake.name(),
                "field2": fake.email()
            }
        }) 