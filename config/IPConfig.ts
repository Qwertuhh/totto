import { readFileSync, writeFileSync } from "fs";
import { networkInterfaces } from "os";

function updateConfigWithLocalIP(configFile: string): void {
  function getLocalIPv4(): string | undefined {
    const nets = networkInterfaces();
    for (const iface of Object.values(nets)) {
      if (!iface) continue;
      for (const net of iface) {
        if (net.family === "IPv4" && !net.internal) {
          return net.address;
        }
      }
    }
    return undefined;
  }

  const localIP = getLocalIPv4();
  if (!localIP) throw new Error("Local IP not found");

  const template = readFileSync(configFile, "utf-8");
  const finalConfig = template.replace("{{IP}}", localIP);

  writeFileSync(configFile, finalConfig);
  console.log(`\x1b[32m${`Config file updated with local IP ${localIP}`} \x1b[0m`);
}

updateConfigWithLocalIP("config/prometheus.yaml");