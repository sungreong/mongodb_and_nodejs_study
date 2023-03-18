const faker = require("faker");
const { User, Blog, Comment } = require("./src/models");

generateFakeData = async (userCount, blogsPerUser, commentsPerUser) => {
    if (typeof userCount !== "number" || userCount < 1)
        throw new Error("userCount must be a positive integer");
    if (typeof blogsPerUser !== "number" || blogsPerUser < 1)
        throw new Error("blogsPerUser must be a positive integer");
    if (typeof commentsPerUser !== "number" || commentsPerUser < 1)
        throw new Error("commentsPerUser must be a positive integer");
    const users = [];
    const blogs = [];
    const comments = [];
    console.log("Preparing fake data.");

    for (let i = 0; i < userCount; i++) {
        users.push(
            new User({
                // user name unique하게 설정 
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
    // for loop 과 같은 것
    // 해당 user 가 멀 할 지를 선언한다는 뜻
    // i++ 가 하나씩 증가하는 것을 의미함.
    users.map(async (user) => {
        for (let i = 0; i < blogsPerUser; i++) {
            blogs.push(
                new Blog({
                    title: faker.lorem.words(),
                    content: faker.lorem.paragraphs(),
                    islive: true,
                    user,
                    // user의 id가 저장되는 개념
                })
            );
        }
    });

    users.map((user) => {
        for (let i = 0; i < commentsPerUser; i++) {
            // 0에서 99사이의 값이 나와서 반내림처리
            let index = Math.floor(Math.random() * blogs.length);
            comments.push(
                new Comment({
                    content: faker.lorem.sentence(),
                    user,
                    blog: blogs[index]._id,
                })
            );
        }
    });

    console.log("fake data inserting to database...");
    await User.insertMany(users);
    console.log(`${users.length} fake users generated!`);
    await Blog.insertMany(blogs);
    console.log(`${blogs.length} fake blogs generated!`);
    await Comment.insertMany(comments);
    console.log(`${comments.length} fake comments generated!`);
    console.log("COMPLETE!!");
};

module.exports = { generateFakeData };