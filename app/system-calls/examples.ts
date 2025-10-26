import { DemoScenario } from './types'

export const demoScenarios: { [key: string]: DemoScenario } = {
  fork: {
    name: 'fork() - Process Creation',
    description: 'Demonstrates how fork() creates a child process',
    code: `#include <stdio.h>
#include <unistd.h>

int main() {
    pid_t pid;
    printf("Parent PID: %d\\n", getpid());
    
    pid = fork();
    
    if (pid < 0) {
        printf("Fork failed\\n");
    } else if (pid == 0) {
        printf("Child PID: %d\\n", getpid());
    } else {
        printf("Parent created child: %d\\n", pid);
    }
    return 0;
}`,
    steps: [
      'Parent process starts execution',
      'fork() system call creates exact copy of process',
      'Parent receives child PID (> 0)',
      'Child receives 0 as return value',
      'Both processes continue execution independently',
    ],
    concepts: [
      'Process duplication',
      'Return value differs in parent and child',
      'Memory space is copied (Copy-on-Write)',
      'File descriptors are inherited',
    ],
  },

  exec: {
    name: 'exec() - Program Execution',
    description: 'Shows how exec() replaces process image with new program',
    code: `#include <stdio.h>
#include <unistd.h>

int main() {
    printf("Before exec()\\n");
    
    execl("/bin/ls", "ls", "-l", NULL);
    
    // This line never executes if exec succeeds
    printf("After exec()\\n");
    return 0;
}`,
    steps: [
      'Process begins executing original program',
      'exec() system call is invoked',
      'Current process image is replaced with new program',
      'New program starts from its main()',
      'Original code is completely replaced',
    ],
    concepts: [
      'Process image replacement',
      'PID remains the same',
      'No return on success',
      'File descriptors remain open (unless close-on-exec)',
    ],
  },

  forkexec: {
    name: 'fork() + exec() Pattern',
    description: 'Common pattern to create new process running different program',
    code: `#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    pid_t pid = fork();
    
    if (pid == 0) {
        // Child process
        execl("/bin/echo", "echo", "Hello!", NULL);
    } else {
        // Parent process
        wait(NULL);
        printf("Child finished\\n");
    }
    return 0;
}`,
    steps: [
      'Parent forks to create child process',
      'Child calls exec() to run new program',
      'Parent calls wait() to wait for child',
      'Child executes and terminates',
      'Parent resumes after child exits',
    ],
    concepts: [
      'Fork-exec pattern',
      'Process creation and replacement',
      'Parent-child synchronization',
      'Zombie prevention with wait()',
    ],
  },

  wait: {
    name: 'wait() - Process Synchronization',
    description: 'Parent waits for child process to terminate',
    code: `#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    pid_t pid = fork();
    
    if (pid == 0) {
        sleep(2);
        printf("Child done\\n");
        exit(42);
    } else {
        int status;
        wait(&status);
        printf("Child returned: %d\\n", 
               WEXITSTATUS(status));
    }
    return 0;
}`,
    steps: [
      'Parent creates child process',
      'Child executes and prepares to exit',
      'Parent calls wait() and blocks',
      'Child exits with return code',
      'Parent receives exit status and resumes',
    ],
    concepts: [
      'Process synchronization',
      'Blocking system call',
      'Exit status retrieval',
      'Zombie process prevention',
    ],
  },

  pipe: {
    name: 'pipe() - Inter-Process Communication',
    description: 'Two processes communicate via pipe',
    code: `#include <stdio.h>
#include <unistd.h>

int main() {
    int fd[2];
    pipe(fd);
    
    if (fork() == 0) {
        // Child writes
        close(fd[0]);
        write(fd[1], "Hello", 5);
        close(fd[1]);
    } else {
        // Parent reads
        close(fd[1]);
        char buf[10];
        read(fd[0], buf, 5);
        printf("Received: %s\\n", buf);
        close(fd[0]);
    }
    return 0;
}`,
    steps: [
      'Create pipe with read and write ends',
      'Fork creates child process',
      'Child writes data to pipe',
      'Parent reads data from pipe',
      'Both processes close file descriptors',
    ],
    concepts: [
      'Inter-process communication',
      'Unidirectional data flow',
      'File descriptor inheritance',
      'Blocking I/O operations',
    ],
  },

  fileio: {
    name: 'File I/O System Calls',
    description: 'Open, read, write, and close file operations',
    code: `#include <fcntl.h>
#include <unistd.h>

int main() {
    int fd = open("file.txt", O_RDWR);
    
    char buf[100];
    read(fd, buf, 100);
    
    write(fd, "data", 4);
    
    close(fd);
    return 0;
}`,
    steps: [
      'open() creates file descriptor',
      'read() retrieves data from file',
      'write() saves data to file',
      'close() releases file descriptor',
    ],
    concepts: [
      'File descriptor management',
      'Sequential file access',
      'System-level I/O',
      'Resource cleanup',
    ],
  },
}

export const processColors = [
  '#00ff41', '#00d4ff', '#ff00ff', '#ffaa00',
  '#ff6b6b', '#51cf66', '#ffd43b', '#a78bfa',
]

export const systemCallCategories = {
  'Process Control': ['fork', 'exec', 'wait', 'exit'],
  'File Operations': ['open', 'read', 'write', 'close'],
  'Communication': ['pipe', 'signal'],
  'Memory': ['malloc', 'free'],
}

