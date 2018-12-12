#include <stdio.h>
#include <string.h>

unsigned long hashCode(char *str);
void printLog();
void writeToLog();
int integrityCheck();

typedef int bool;
#define TRUE 1;
#define FALSE 0;

int main(int argc, char **argv)
{
    char *log = argv[1];

    if (strcmp(log, "read") == 0)
        printLog();
    else
        writeToLog(log);

    return 0;
}

void printLog()
{
    int result = integrityCheck();
    if( result == 0 ){
        printf("\nAdmin log file has been tempered with:...\n");
        return;
    }

    FILE *file = fopen("admin.log", "r");

    char line[256];

    while (fgets(line, sizeof(line), file))
    {
        printf("%s", line);
    }
    fclose(file);
}

void writeToLog(char *log)
{
    // Checks the integrity of the file
    int result = integrityCheck();
    if( result == 0 ){
        return;
    }

    // Opening file to writing
    FILE *file = fopen("admin.log", "r+");
    char lastLine[255];

    // Sets lasLine variable to last line of the file
    while (fgets(lastLine, sizeof(lastLine), file))
    {
        ;
    }

    char *lastLogMessage = strtok(lastLine, ":");
    char *lastMessageHash = strtok(NULL, ":");

    char chainedLogMessage[512];
    char clearChainedLogMessage[512];
    int count=0;

    sprintf(chainedLogMessage,"%s%s",log, lastMessageHash);

    // remove new line char
    for(int i=0; chainedLogMessage[i] != '\0';++i){
        if(chainedLogMessage[i] != '\n')
            clearChainedLogMessage[count++] = chainedLogMessage[i];
    }
    clearChainedLogMessage[count]='\0';

    // Writing to FILE
    fprintf(file, "%s:%lu\n", log, hashCode(clearChainedLogMessage));

    fclose(file);
}

int integrityCheck()
{
    FILE *file = fopen("admin.log", "r");
    if(file == NULL){
        puts("logger: New Admin.log has been created");
        file = fopen("admin.log", "w");
        fprintf(file, "%s:%lu\n", "StudentWorks", hashCode("StudentWorks"));
    }

    int count = 0;
    
    char line[256];

    bool valid = TRUE;

    char *currentLog;
    char *currentHashCode;

    char log[255];
    char var2[255];
    char prevHash[255];
    char hash[255];

    char testHashCode[255];
    char chainedLogMessage[255];
    char clearChainedLogMessage[255];

    while (fgets(line, sizeof(line), file))
    {

        int idx = 0;

        // Get the current log message
        strcpy(log, strtok(line, ":"));

        // Get a hash code associated with the current message
        strcpy(var2, strtok(NULL, ":"));

        // Removes newline '\n' characters
        for(int i=0; var2[i] != '\0'; i++){
            if(var2[i] != '\n')
                hash[idx++] = var2[i];
        }
        
        hash[idx]='\0';

        // skip first record and records seed hash code
        if (count == 0)
        {
            strcpy(prevHash, hash);
            count++;
            continue;
        }
              
        // Adds previous record's hashcode to the current log messages
        sprintf(chainedLogMessage,"%s%s",log, prevHash);

        // Hashesh the string above
        sprintf(testHashCode, "%lu", hashCode(chainedLogMessage));

        // prepares for next line
        strcpy(prevHash, hash);

        // Testing for Match, strcmp() returns 0 if euqal
        if (strcmp(hash, testHashCode))
        {
            valid = FALSE;
            break;
        }
    }
    return valid;
}

// Hashing function by Dan J. Bernstein
unsigned long hashCode(char *str)
{
    unsigned long hash = 5381;
    int c;

    while ((c = *str++))
        hash = ((hash << 5) + hash) + c;

    return hash;
}