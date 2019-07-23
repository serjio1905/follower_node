var mysql = require('mysql');
var connection = mysql.createConnection({
    host: process.env.SQL_URL,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB,
    port: process.env.SQL_PORT
});
connection.connect(function (err) {
    if (err) {
        console.log('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
});

exports.addUser = async (req, res, next) => {
    const query = `
        INSERT INTO users (name, group_id)
        VALUES ('${req.body.user_name}', '${req.body.group_id}')
    `;
    connection.query(query, (error, results, fields) => {
        if (error) {
            res.status(400).send("DataBaseError");
        } else {
            res.status(200).send("OK");
        }
        // connection.end();
    });
}

exports.addGroup = async (req, res, next) => {
    const query = `INSERT INTO user_groups (name) VALUES ('${req.body.group_name}')`;
    connection.query(query, (error, results, fields) => {
        if (error) {
            res.status(400).send("DataBaseError");
        } else {
            res.status(200).send("OK");
        }
        // connection.end();
    });
}

exports.follow = async (req, res, next) => {
    const checkQuery = `
        SELECT COUNT(*)
        FROM followers
        WHERE user_id = '${req.body.user_id}' AND follower_id = '${req.body.follower_id}'
    `;
    connection.query(checkQuery, (error, results, fields) => {
        if (error) {
            res.status(400).send("DataBaseError");
        } else {
            if (results[0]['COUNT(*)'] > 0) {
                res.status(200).send("OK");
            } else {
                const query = `
                    INSERT INTO followers (user_id, follower_id)
                    VALUES ('${req.body.user_id}', '${req.body.follower_id}') 
                `;
                connection.query(query, (error, results, fields) => {
                    if (error) {
                        res.status(400).send("DataBaseError");
                    } else {
                        res.status(200).send("OK");
                    }
                })
            }
        }
    });
}

exports.unfollow = async (req, res, next) => {
    const query = `
        DELETE FROM followers
        WHERE user_id = '${req.body.user_id}' AND follower_id = '${req.body.follower_id}'
    `;
    connection.query(query, (error, results, fields) => {
        if (error) {
            res.status(400).send("DataBaseError");
        } else {
            res.status(200).send("OK");
        }
    })
}

exports.getUsers = async (req, res, next) => {
    const query = `
        SELECT users.id,
            users.name,
            users.group_id,
            user_groups.name AS group_name
        FROM users
        INNER JOIN user_groups
        ON users.group_id = user_groups.id
    `;
    const queryFollowers = `
        SELECT user_id, COUNT(follower_id) AS follower_count
        FROM followers
        GROUP BY user_id
    `;
    connection.query(query, (error, results, fields) => {
        const resUsers = [];
        if (error) {
            res.status(400).send("DataBaseError");
        } else {
            connection.query(queryFollowers, (errorF, resultsF, fieldsF) => {
                results.forEach(user => {
                    const userRes = {...user, follower_count: 0};
                    resultsF.forEach(follower => {
                        if(userRes.id === follower.user_id) {
                            userRes.follower_count = follower.follower_count;
                        }
                    });
                    console.log(userRes);
                    resUsers.push(userRes);
                });
                res.status(200).send(resUsers);
            });
        }
    })
}

exports.getGroups = async (req, res, next) => {
    const query = `
        SELECT user_groups.id,
            user_groups.name,
            COUNT (users.id) AS follows
        FROM user_groups
        LEFT JOIN users
        ON user_groups.id = users.group_id
        GROUP BY user_groups.id
    `;
    connection.query(query, (error, results, fields) => {
        if (error) {
            console.log(error)
            res.status(400).send("DataBaseError");
        } else {
            console.log(results)
            res.status(200).send(results);
        }
    })
}

exports.getUser = async (req, res, next) => {
    const query = `
        SELECT * FROM users WHERE id = ${req.params.id}
    `;
    connection.query(query, (error, results, fields) => {
        if (error) {
            console.log(error)
            res.status(400).send("DataBaseError");
        } else {
            const followedByQuery = `
                SELECT user_id FROM followers WHERE follower_id = ${req.params.id}
            `;
            connection.query(followedByQuery, (errorF, resultsF, fieldsF) => {
                if (errorF) {
                    console.log(errorF)
                    res.status(400).send("DataBaseError");
                } else {
                    console.log("resultsF", resultsF);
                    const following = [];
                    resultsF.forEach(value => {
                        following.push(value.user_id);
                    });
                    const result = {...results[0], following};
                    res.status(200).send(result);
                }
            });
        }
    });
}