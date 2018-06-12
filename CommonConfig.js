const config = {
    env: {
        doc: "The applicaton environment.",
        format: ["production", "development", "test"],
        default: "development",
        env: "NODE_ENV"
    },
    server: {
        ip: {
            doc: "IP address to bind",
            format: 'ipaddress',
            default: '0.0.0.0',
            env: "IP"
        },
        port: {
            doc: "port to bind",
            format: 'port',
            default: 3000,
            env: "PORT"
        },
        session: {
            auth_token_expire: 30 * 24 * 60 * 60
        }
    },
    log: {
        dateformat: {
            doc: "date format",
            default: 'YYYY-MM-DD'
        },
        frequency: {
            doc: 'the log file rotate frequency',
            default: "daily"
        }
    },
    mongodb: {
        url: {
            doc: "mongodb url",
            "default": "mongodb://localhost/test"
        }
    },
    redis: {
        host: '127.0.0.1',
        port: 6379
    },
    endpoint: {
        metricservice: 'http://localhost:3112'
    },
    service: {
        name: 'Service' //service name, should be overriden
    },
    upload_dir: {
        doc: "Upload cache file directory",
        default: "cache_files/"
    },
    aws: {
        s3: {
            header: {
                bucket: "sleepaiden-header",
                accessKeyId: "AKIAIWRCL3EIHF4U37DA",
                secretAccessKey: "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",
                region: "us-west-2"
            },
            logs: {
                bucket: "sleepaiden-logs",
                accessKeyId: "AKIAIWRCL3EIHF4U37DA",
                secretAccessKey: "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",
                region: "us-west-2"
            }
        },
        ses: {
            accessKeyId: "AKIAI6JGB7F64VKZ4SIA",
            secretAccessKey: "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",
            region: "us-west-2"
        }
    },
    email: {
        from_email: "aiden@sleepaiden.com"
    },
    email_template: {
        register: {
            subject: "Welcome to SleepRecord",
            html: "Hi %s,<br>Welcome to use SleepRecord.<br>Please input the code to verify your email: %s<br>Thanks<br>The SleepRecord Team"
        },
        reset_email: {
            subject: "Reset your password",
            html: "Hi %s,<br>Please input this security code to reset your password: %s<br>Thanks<br>The SleepRecord Team"
        }
    },
    google: {
        client_id: "894802459298-3637204prl1d2vnce72bfjeptjivmg18.apps.googleusercontent.com",
        secret: "AIzaSyDGvFHSmqeOVtLmz7s18SSbrLxMYDrzEEM"
    },
    facebook: {
        app_id: "1891279461107263",
        secret: "aaa03e9f3f84ce950826fed305fa477d"
    },
    wechat: {
        app_id: "",
        secret: ""
    }
};

export default config;
