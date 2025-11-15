#!/usr/bin/env python3
"""
Server Starter Script
Starts both frontend and backend when run without arguments.
Allows starting either frontend or backend individually.
"""

import subprocess
import sys
import socket
import time
import os
import signal
import threading
import shutil
import queue
from pathlib import Path

# Port configurations
FRONTEND_PORT = 5173  # Vite default port
BACKEND_PORT = 5000   # Express default port

# Process names to check
FRONTEND_PROCESS = "vite"
BACKEND_PROCESS = "node"

def is_port_in_use(port):
    """Check if a port is currently in use."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('localhost', port))
            return False
        except OSError:
            return True

def check_process_running(process_name, port):
    """Check if a process is running by checking the port."""
    return is_port_in_use(port)

def run_npm_command(command, shell=None):
    """Run an npm command with proper Windows/Unix handling."""
    if shell is None:
        shell = (sys.platform == "win32")
    
    # Use UTF-8 encoding with error handling to avoid UnicodeDecodeError
    encoding = 'utf-8'
    errors = 'replace'  # Replace invalid characters instead of crashing
    
    if shell:
        # On Windows, use shell=True with the full command
        if sys.platform == "win32":
            # Use cmd.exe /c for Windows
            full_command = f"npm {command}"
            return subprocess.Popen(
                full_command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding=encoding,
                errors=errors,
                bufsize=1,
                universal_newlines=True
            )
        else:
            # On Unix-like systems, use shell=True
            return subprocess.Popen(
                f"npm {command}",
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding=encoding,
                errors=errors,
                bufsize=1,
                universal_newlines=True
            )
    else:
        # Try to find npm in PATH
        npm_path = shutil.which("npm")
        if npm_path:
            return subprocess.Popen(
                [npm_path] + command.split(),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding=encoding,
                errors=errors,
                bufsize=1,
                universal_newlines=True
            )
        else:
            # Fallback to shell=True
            return subprocess.Popen(
                f"npm {command}",
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding=encoding,
                errors=errors,
                bufsize=1,
                universal_newlines=True
            )

def start_frontend(check_backend=True):
    """Start the frontend development server."""
    if check_process_running(FRONTEND_PROCESS, FRONTEND_PORT):
        print(f"❌ Frontend is already running on port {FRONTEND_PORT}")
        return False
    
    if check_backend and check_process_running(BACKEND_PROCESS, BACKEND_PORT):
        print(f"❌ Backend is already running on port {BACKEND_PORT}")
        print("⚠️  Cannot start frontend while backend is running.")
        print("   Please stop the backend first or use 'python start_server.py stop backend'")
        return False
    
    print("🚀 Starting frontend server...")
    print(f"   Frontend will be available at http://localhost:{FRONTEND_PORT}")
    
    try:
        # Start the frontend using npm run dev
        if sys.platform == "win32":
            subprocess.run("npm run dev", shell=True, check=True)
        else:
            subprocess.run(["npm", "run", "dev"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting frontend: {e}")
        return False
    except KeyboardInterrupt:
        print("\n⚠️  Frontend server stopped by user")
        return False
    
    return True

def start_backend(check_frontend=True):
    """Start the backend server."""
    if check_process_running(BACKEND_PROCESS, BACKEND_PORT):
        print(f"❌ Backend is already running on port {BACKEND_PORT}")
        return False
    
    if check_frontend and check_process_running(FRONTEND_PROCESS, FRONTEND_PORT):
        print(f"❌ Frontend is already running on port {FRONTEND_PORT}")
        print("⚠️  Cannot start backend while frontend is running.")
        print("   Please stop the frontend first or use 'python start_server.py stop frontend'")
        return False
    
    print("🚀 Starting backend server...")
    print(f"   Backend will be available at http://localhost:{BACKEND_PORT}")
    
    try:
        # Start the backend using npm run server
        if sys.platform == "win32":
            subprocess.run("npm run server", shell=True, check=True)
        else:
            subprocess.run(["npm", "run", "server"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting backend: {e}")
        return False
    except KeyboardInterrupt:
        print("\n⚠️  Backend server stopped by user")
        return False
    
    return True

def start_both():
    """Start both frontend and backend servers concurrently."""
    # Check if either is already running
    frontend_running = check_process_running(FRONTEND_PROCESS, FRONTEND_PORT)
    backend_running = check_process_running(BACKEND_PROCESS, BACKEND_PORT)
    
    if frontend_running:
        print(f"⚠️  Frontend is already running on port {FRONTEND_PORT}")
    if backend_running:
        print(f"⚠️  Backend is already running on port {BACKEND_PORT}")
    
    if frontend_running and backend_running:
        print("ℹ️  Both servers are already running!")
        return True
    
    print("🚀 Starting both frontend and backend servers...")
    print(f"   Frontend will be available at http://localhost:{FRONTEND_PORT}")
    print(f"   Backend will be available at http://localhost:{BACKEND_PORT}")
    print("\n⚠️  Press Ctrl+C to stop both servers\n")
    
    processes = []
    
    try:
        # Start backend if not running
        if not backend_running:
            backend_process = run_npm_command("run server")
            processes.append(("backend", backend_process))
            print("✅ Backend process started")
        
        # Start frontend if not running
        if not frontend_running:
            frontend_process = run_npm_command("run dev")
            processes.append(("frontend", frontend_process))
            print("✅ Frontend process started")
        
        # Wait a bit for servers to start
        time.sleep(2)
        
        # Monitor processes and print output
        def print_output(name, process):
            """Print output from a process."""
            
            # Create queues for stdout and stderr
            stdout_queue = queue.Queue()
            stderr_queue = queue.Queue()
            
            def read_stdout():
                try:
                    for line in iter(process.stdout.readline, ''):
                        if line:
                            stdout_queue.put(line)
                except (UnicodeDecodeError, UnicodeError) as e:
                    # Handle encoding errors gracefully
                    print(f"[{name}] Encoding error in stdout: {e}", file=sys.stderr)
                except Exception as e:
                    # Handle any other errors
                    print(f"[{name}] Error reading stdout: {e}", file=sys.stderr)
                finally:
                    stdout_queue.put(None)
            
            def read_stderr():
                try:
                    for line in iter(process.stderr.readline, ''):
                        if line:
                            stderr_queue.put(line)
                except (UnicodeDecodeError, UnicodeError) as e:
                    # Handle encoding errors gracefully
                    print(f"[{name}] Encoding error in stderr: {e}", file=sys.stderr)
                except Exception as e:
                    # Handle any other errors
                    print(f"[{name}] Error reading stderr: {e}", file=sys.stderr)
                finally:
                    stderr_queue.put(None)
            
            # Start reader threads
            stdout_thread = threading.Thread(target=read_stdout, daemon=True)
            stderr_thread = threading.Thread(target=read_stderr, daemon=True)
            stdout_thread.start()
            stderr_thread.start()
            
            # Print from both queues
            while True:
                try:
                    line = stdout_queue.get(timeout=0.1)
                    if line is None:
                        break
                    print(f"[{name}] {line}", end='')
                except queue.Empty:
                    pass
                
                try:
                    line = stderr_queue.get(timeout=0.1)
                    if line is None:
                        break
                    print(f"[{name}] {line}", end='', file=sys.stderr)
                except queue.Empty:
                    pass
                
                # Check if process is still running
                if process.poll() is not None:
                    # Process ended, drain remaining queues
                    while True:
                        try:
                            line = stdout_queue.get_nowait()
                            if line:
                                print(f"[{name}] {line}", end='')
                        except queue.Empty:
                            break
                    while True:
                        try:
                            line = stderr_queue.get_nowait()
                            if line:
                                print(f"[{name}] {line}", end='', file=sys.stderr)
                        except queue.Empty:
                            break
                    break
        
        # Start threads to print output
        threads = []
        for name, process in processes:
            thread = threading.Thread(target=print_output, args=(name, process), daemon=True)
            thread.start()
            threads.append(thread)
        
        # Wait for processes
        while True:
            time.sleep(1)
            # Check if any process has died
            for name, process in processes:
                if process.poll() is not None:
                    print(f"\n❌ {name.capitalize()} process exited with code {process.returncode}")
                    # Kill other processes
                    for other_name, other_process in processes:
                        if other_process.poll() is None:
                            other_process.terminate()
                    return False
    
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping both servers...")
        for name, process in processes:
            if process.poll() is None:
                process.terminate()
                print(f"✅ Stopped {name} server")
        time.sleep(1)
        # Force kill if still running
        for name, process in processes:
            if process.poll() is None:
                process.kill()
        return True
    except Exception as e:
        print(f"❌ Error starting servers: {e}")
        # Clean up processes
        for name, process in processes:
            if process.poll() is None:
                process.terminate()
        return False

def stop_server(server_type):
    """Stop a running server by finding and killing the process."""
    if server_type == "frontend":
        port = FRONTEND_PORT
        process_name = FRONTEND_PROCESS
    elif server_type == "backend":
        port = BACKEND_PORT
        process_name = BACKEND_PROCESS
    else:
        print(f"❌ Unknown server type: {server_type}")
        return False
    
    if not check_process_running(process_name, port):
        print(f"ℹ️  {server_type.capitalize()} is not running on port {port}")
        return False
    
    print(f"🛑 Stopping {server_type} server on port {port}...")
    
    try:
        # Find process using the port (Windows compatible)
        if sys.platform == "win32":
            # Windows: Use netstat to find PID
            result = subprocess.run(
                ["netstat", "-ano"],
                capture_output=True,
                text=True,
                check=True
            )
            for line in result.stdout.split('\n'):
                if f":{port}" in line and "LISTENING" in line:
                    parts = line.split()
                    if len(parts) > 0:
                        pid = parts[-1]
                        try:
                            os.kill(int(pid), signal.SIGTERM)
                            print(f"✅ Stopped {server_type} server (PID: {pid})")
                            time.sleep(1)
                            return True
                        except (ValueError, ProcessLookupError, PermissionError) as e:
                            print(f"⚠️  Could not stop process: {e}")
        else:
            # Unix/Linux/Mac: Use lsof to find PID
            result = subprocess.run(
                ["lsof", "-ti", f":{port}"],
                capture_output=True,
                text=True
            )
            if result.returncode == 0 and result.stdout.strip():
                pid = int(result.stdout.strip())
                os.kill(pid, signal.SIGTERM)
                print(f"✅ Stopped {server_type} server (PID: {pid})")
                time.sleep(1)
                return True
    except Exception as e:
        print(f"❌ Error stopping {server_type}: {e}")
        print("   You may need to stop it manually")
        return False
    
    print(f"⚠️  Could not find process on port {port}")
    return False

def check_status():
    """Check the status of both servers."""
    frontend_running = check_process_running(FRONTEND_PROCESS, FRONTEND_PORT)
    backend_running = check_process_running(BACKEND_PROCESS, BACKEND_PORT)
    
    print("\n📊 Server Status:")
    print("=" * 50)
    
    if frontend_running:
        print(f"✅ Frontend: Running on port {FRONTEND_PORT}")
    else:
        print(f"❌ Frontend: Not running (port {FRONTEND_PORT})")
    
    if backend_running:
        print(f"✅ Backend: Running on port {BACKEND_PORT}")
    else:
        print(f"❌ Backend: Not running (port {BACKEND_PORT})")
    
    print("=" * 50)
    
    if frontend_running and backend_running:
        print("✅ Both servers are running")
    elif not frontend_running and not backend_running:
        print("ℹ️  No servers are currently running")
    else:
        print("⚠️  Only one server is running")

def print_usage():
    """Print usage information."""
    print("""
🚀 Server Starter Script
Starts both frontend and backend servers.

Usage:
    python start_server.py                    Start both frontend and backend
    python start_server.py <command> [options]

Commands:
    (no args)         Start both frontend and backend servers
    start frontend    Start only the frontend development server
    start backend     Start only the backend server
    stop frontend     Stop the frontend server
    stop backend      Stop the backend server
    status            Check the status of both servers
    help              Show this help message

Examples:
    python start_server.py                    # Start both servers
    python start_server.py start frontend    # Start only frontend
    python start_server.py start backend     # Start only backend
    python start_server.py status            # Check status
    python start_server.py stop frontend     # Stop frontend
""")

def main():
    """Main function to handle command-line arguments."""
    # If no arguments, start both servers
    if len(sys.argv) < 2:
        success = start_both()
        sys.exit(0 if success else 1)
    
    command = sys.argv[1].lower()
    
    if command == "help" or command == "-h" or command == "--help":
        print_usage()
        sys.exit(0)
    
    elif command == "status":
        check_status()
    
    elif command == "start":
        if len(sys.argv) < 3:
            print("❌ Error: Please specify 'frontend' or 'backend'")
            print("   Usage: python start_server.py start <frontend|backend>")
            print("   Or run 'python start_server.py' to start both")
            sys.exit(1)
        
        server_type = sys.argv[2].lower()
        
        if server_type == "frontend":
            success = start_frontend()
            sys.exit(0 if success else 1)
        elif server_type == "backend":
            success = start_backend()
            sys.exit(0 if success else 1)
        else:
            print(f"❌ Error: Unknown server type '{server_type}'")
            print("   Use 'frontend' or 'backend'")
            sys.exit(1)
    
    elif command == "stop":
        if len(sys.argv) < 3:
            print("❌ Error: Please specify 'frontend' or 'backend'")
            print("   Usage: python start_server.py stop <frontend|backend>")
            sys.exit(1)
        
        server_type = sys.argv[2].lower()
        stop_server(server_type)
    
    else:
        print(f"❌ Error: Unknown command '{command}'")
        print_usage()
        sys.exit(1)

if __name__ == "__main__":
    main()

