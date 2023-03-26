db.createUser(
    {
            user: "tubui",
            pwd: "csbtubui",
            roles: [
                {
                    role: "root"
                    db: "call-spam-blocker"
                }
            ]
    }
);