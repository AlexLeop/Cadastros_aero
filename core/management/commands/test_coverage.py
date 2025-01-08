from django.core.management.base import BaseCommand
import coverage
import os
import sys

class Command(BaseCommand):
    help = 'Executa testes com relatório de cobertura'

    def handle(self, *args, **options):
        cov = coverage.Coverage(
            source=['files', 'records', 'notifications', 'settings'],
            omit=['*/tests/*', '*/migrations/*']
        )
        cov.start()
        
        # Executar testes
        from django.core.management import call_command
        call_command('test', verbosity=2)
        
        cov.stop()
        cov.save()
        
        # Gerar relatório HTML
        cov.html_report(directory='coverage_html')
        
        # Mostrar relatório no terminal
        cov.report()
        
        # Verificar cobertura mínima
        if cov.report() < 80:
            self.stdout.write(self.style.ERROR(
                'Cobertura de testes abaixo de 80%'
            ))
            sys.exit(1) 