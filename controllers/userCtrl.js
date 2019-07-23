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
        SELECT users.id, users.name, users.group_id, user_groups.name AS group_name, IFNULL(followers.count_followers, 0) AS count_followers
        FROM users
        INNER JOIN user_groups
        ON users.group_id = user_groups.id
        LEFT JOIN (SELECT user_id,  COUNT(user_id) AS count_followers FROM followers) AS followers
        ON users.id = followers.user_id
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