const faker = require("faker");
const { User } = require("./src/models");
const axios = require("axios");
const URI = "http://localhost:3000";

generateFakeData = async (userCount, blogsPerUser, commentsPerUser) => {
    try {
        if (typeof userCount !== "number" || userCount < 1)
            throw new Error("userCount must be a positive integer");
        if (typeof blogsPerUser !== "number" || blogsPerUser < 1)
            throw new Error("blogsPerUser must be a positive integer");
        if (typeof commentsPerUser !== "number" || commentsPerUser < 1)
            throw new Error("commentsPerUser must be a positive integer");
        let users = [];
        let blogs = [];
        let comments = [];

        for (let i = 0; i < userCount; i++) {
            users.push(
                new User({
                    username: faker.internet.userName() + parseInt(Math.random() * 100),
                    name: {
                        first: faker.name.firstName(),
                        last: faker.name.lastName(),
                    },
                    age: 10 + parseInt(Math.random() * 50),
                    email: faker.internet.email(),
                })
            );
        }

        console.log("fake data inserting to database...");

        await User.insertMany(users);
        console.log(`${users.length} fake users generated!`);

        users.map((user) => {
            for (let i = 0; i < blogsPerUser; i++) {
                blogs.push(
                    // API 사용
                    // axios에서 사용하기 때문에 서버가 켜져 있지 않으면 작동 안함.
                    // app.listen 이후에 서버가 켜진느 것임.
                    axios.post(`${URI}/blog`, {
                        title: faker.lorem.words(),
                        content: faker.lorem.paragraphs(),
                        islive: true,
                        userId: user.id,
                    })
                );
            }
        });
        // API에 return 값이 저장됨
        let newBlogs = await Promise.all(blogs);
        console.log(`${newBlogs.length} fake blogs generated!`);

        users.map((user) => {
            for (let i = 0; i < commentsPerUser; i++) {
                let index = Math.floor(Math.random() * blogs.length);
                // API를 통해 적재함.
                comments.push(
                    axios.post(`${URI}/blog/${newBlogs[index].data.blog._id}/comment`, {
                        content: faker.lorem.sentence(),
                        userId: user.id,
                    })
                );
            }
        });

        await Promise.all(comments);
        console.log(`${comments.length} fake comments generated!`);
        console.log("COMPLETE!!");
    } catch (err) {
        console.log(err);
    }
};

module.exports = { generateFakeData };