import mongoose from "mongoose";  //mongoose是一个从mongoose模块引入的对象变量 包括很多方法可用

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
         console.log("MONGODB CONNECTED SUCCESSFULLY!鸭鸭鸭");
    }
    catch (error)
    {
        console.error("Error connecting to MONGODB 鸭鸭鸭", error);
        process.exit(1); // Exit process with failure
    }
};


// export const connectDB1 = async function(){
//     try
//     {
//         await mongoose.connect("xxxxxxxxxxxx");
//         console.log("sss");
//     }catch{
//         console.error("sss");
//     }
// };

//async 异步函数 意味着内部操作不需要立即完成 ，可以继续执行其他操作 ，而不会阻塞程序执行
//await 等待异步操作完成，并返回结果 
//为什么连接数据库要要使用async  因为连接数据库是一个 耗时操作。如果没有 async： JavaScript 这种“单线程”语言会卡死在那里，等数据库连接成功（可能需要 1 秒）之后才继续运行。这期间服务器无法响应任何其他人的请求。
// 运行到 await 时发生了什么？

// 当我们写 await mongoose.connect(...) 时，程序确实会**“停”**在这一行，但这个“停”是非常聪明的：

//     暂停当前函数： connectDB 函数内部的执行会暂时挂起。它会记住：“我还没执行完，我在等数据库的回信。”

//     释放主线程： 关键点来了！JavaScript 的主线程会立刻从 connectDB 函数中跳出来，继续执行 server.js 里的下一行代码（比如设置中间件、设置路由等）。

//     后台执行任务： 连接数据库的任务交给了底层的网络模块去处理，它不占用 JavaScript 的主线程。

//     任务完成后归队： 一旦数据库连上了，这个事件会被丢进“任务队列”。主线程闲下来时，会回到 connectDB 函数中 await 的位置，接着执行后面的 console.log("MongoDB Connected")