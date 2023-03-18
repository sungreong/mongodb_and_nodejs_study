console.log("client code running123.")
const axios = require("axios")

// const test = async () => {
//     // let을 사용해야 함.
//     let { data: { blogs } } = await axios.get("http://localhost:3000/blog")
//     // Axios는 브라우저, Node.js를 위한 Promise API를 활용하는 HTTP 비동기 통신 라이브러리 

//     // blog에다가 user랑 comment를 추가해서 return해주기
//     // map 에 return 한 결과가 그대로 돌아옴. 배열 가공할 때 사용함.
//     // asycn을 달아줘서 promise가 return 됨. 
//     blogs = await Promise.all(blogs.map(async blog => {
//         const res1 = await axios.get(`http://localhost:3000/user/${blog.user}`)
//         const res2 = await axios.get(`http://localhost:3000/blog/${blog._id}/comment`)
//         blog.user = res1.data.user;
//         blog.comments = res2.data.comments;
//         return blog
//     }))
//     console.log(blogs[0])

// }


// const URI = "http://localhost:3000"

// refactoring
// client 에서 돌아가는 코드 (javascript)

// const test = async () => {
//     console.time("time : ")
//     let { data: { blogs } } = await axios.get(`${URI}/blog`)
//     blogs = await Promise.all(blogs.map(async blog => {
//         const [res1, res2] = await Promise.all([
//             axios.get(`${URI}/user/${blog.user}`),
//             axios.get(`${URI}/blog/${blog._id}/comment`)
//         ])

//         blog.user = res1.data.user;
//         blog.comments = await Promise.all(res2.data.comments.map(async (comment) => {
//             const { data: { user } } = await axios.get(`${URI}/user/${comment.user}`)
//             comment.user = user
//             return comment
//         }));

//         return blog
//     }))
//     // 후기별로 자세하게 보고 싶은 경우 (객체인 경우)
//     // console.dir(blogs[0], { depth: 10 })
//     console.timeEnd("time : ")
// }

// 비효율적인 방법
//    - bloglimit 20일 때 6초 초반 
//    - bloglimit 50일 때 16초 초반 
// populdate를 사용한 방법
//    - bloglimit 20일 때 0.8초 초반 
//    - bloglimit 50일 때 0.8초 초반 
//    - bloglimit 50일 때 0.7초 초반 
// nesting 사용한 방법 (한번에 저장하는 방식을 사용할 때)
//    - bloglimit 20일 때 0.1~2초 초반 
//    - bloglimit 50일 때 0.2~3초 초반 
//    - bloglimit 50일 때 0.3초 초반 


const URI = "http://localhost:3000"

// 개선
// blog api 수정을 통해 속도 개선 

const test = async () => {
    console.time("time : ")
    let { data: { blogs } } = await axios.get(`${URI}/blog`)
    console.timeEnd("time : ")
    // console.log(blogs[3])
    return blogs
}

const testGroup = async () => {
    await test()
    await test()
    await test()
    await test()
    await test()
    await test()
    await test()
    await test()
    await test()
    await test()

}
testGroup()