import subprocess
import tempfile
import os
import signal
import time
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
import json
import re

class CodeExecutionView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        try:
            data = json.loads(request.body)
            code = data.get('code', '')
            language = data.get('language', 'python')
            
            # Basic security checks
            if not self._is_safe_code(code):
                return JsonResponse({
                    'success': False,
                    'error': 'Code contains potentially unsafe operations'
                }, status=400)
            
            # Execute code based on language
            if language == 'python':
                result = self._execute_python(code)
            else:
                return JsonResponse({
                    'success': False,
                    'error': f'Language {language} not supported'
                }, status=400)
            
            return JsonResponse(result)
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)

    def _is_safe_code(self, code):
        """Check if code is safe to execute"""
        dangerous_patterns = [
            r'import\s+os',
            r'import\s+subprocess',
            r'import\s+sys',
            r'__import__',
            r'eval\(',
            r'exec\(',
            r'open\(',
            r'file\(',
            r'input\(',
            r'raw_input\(',
            r'compile\(',
            r'globals\(',
            r'locals\(',
            r'vars\(',
            r'dir\(',
            r'help\(',
            r'breakpoint\(',
        ]
        
        code_lower = code.lower()
        for pattern in dangerous_patterns:
            if re.search(pattern, code_lower):
                return False
        return True

    def _execute_python(self, code, timeout=10):
        """Execute Python code safely"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        try:
            # Execute with timeout
            process = subprocess.Popen(
                ['python', temp_file],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=os.setsid if hasattr(os, 'setsid') else None
            )
            
            try:
                stdout, stderr = process.communicate(timeout=timeout)
                return_code = process.returncode
            except subprocess.TimeoutExpired:
                # Kill the process if it times out
                if hasattr(os, 'setsid'):
                    os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                else:
                    process.terminate()
                process.wait()
                return {
                    'success': False,
                    'error': f'Code execution timed out after {timeout} seconds',
                    'output': '',
                    'execution_time': timeout * 1000
                }
            
            # Clean up temp file
            os.unlink(temp_file)
            
            if return_code == 0:
                return {
                    'success': True,
                    'output': stdout,
                    'error': stderr if stderr else '',
                    'execution_time': 0  # Could be enhanced with actual timing
                }
            else:
                return {
                    'success': False,
                    'error': stderr,
                    'output': stdout,
                    'execution_time': 0
                }
                
        except Exception as e:
            # Clean up temp file in case of error
            try:
                os.unlink(temp_file)
            except:
                pass
            return {
                'success': False,
                'error': str(e),
                'output': '',
                'execution_time': 0
            }
