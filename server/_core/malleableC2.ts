import crypto from "node:crypto";

export interface MalleableProfile {
  name: string;
  httpGet: {
    uri: string[];
    client: {
      header: Record<string, string>;
      metadata: {
        parameter: string;
        encoding: 'base64' | 'hex' | 'netbios';
      };
    };
    server: {
      header: Record<string, string>;
      output: {
        prepend: string;
        append: string;
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

export const GoogleDriveProfile: MalleableProfile = {
  name: "google_drive",
  httpGet: {
    uri: ["/drive/v3/files", "/drive/v3/about", "/drive/v3/changes"],
    client: {
      header: {
        "Host": "www.googleapis.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "close"
      },
      metadata: {
        parameter: "pageToken",
        encoding: "base64"
      }
    },
    server: {
      header: {
        "Content-Type": "application/json; charset=UTF-8",
        "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
        "Pragma": "no-cache",
        "Server": "GSE"
      },
      output: {
        prepend: '{"kind":"drive#fileList","incompleteSearch":false,"files":[',
        append: ']}'
      }
    }
  },
  httpPost: {
    uri: ["/upload/drive/v3/files"],
    client: {
      header: {
        "Host": "www.googleapis.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Content-Type": "application/octet-stream"
      },
      id: {
        parameter: "uploadType"
      },
      output: {
        prepend: "",
        append: ""
      }
    }
  }
};

export class MalleableEngine {
  static transformResponse(data: string, profile: MalleableProfile): string {
    return `${profile.httpGet.server.output.prepend}${data}${profile.httpGet.server.output.append}`;
  }

  static extractMetadata(req: any, profile: MalleableProfile): string {
    const raw = req.query[profile.httpGet.client.metadata.parameter];
    if (!raw) return "";
    
    if (profile.httpGet.client.metadata.encoding === 'base64') {
      return Buffer.from(raw, 'base64').toString('utf8');
    }
    return raw;
  }
}
