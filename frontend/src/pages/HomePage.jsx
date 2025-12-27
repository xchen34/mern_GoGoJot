import { useState, useEffect } from 'react' 
import Navbar from "../components/Navbar"
import RateLimitedUI from '../components/RateLimitedUI';
import NoteCard from '../components/NoteCard';
import axios from "axios";
import toast from "react-hot-toast"
const HomePage = () => {
  //数组解构 useState(true)返回的是一个数组 [true, function] 
  // result[0]是当前值 [1]是修改这个值的函数 等价写法为
  // const result = useState(true);   
// const isRateLimited = result[0];
// const setIsRateLimited = result[1];
//useState=一个value + 一个修改value的函数
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchNotes = async () => {
      try{
        // const res = await fetch("http://localhost:5001/api/notes");
        // const data = await res.json();
        const res = await axios.get("http://localhost:5001/api/notes");
        console.log(res.data);
        setNotes(res.data);
        setIsRateLimited(false);
      }catch(error){
        console.log("Error fetching notes鸭鸭鸭");
        if(error.response.status === 429) //arrive rate limit
        {setIsRateLimited(true)}
        else{
          toast.error("Failed to load notes");
        }
      } finally {
           setLoading(false);
      }
      
    };
  
    fetchNotes();
  },[]); 
  //useEffect是做副作用的事情 比如请求接口 操作DOM 订阅/监听 打印日志 定时器
  //[]叫依赖数组 空的是只在组件第一次渲染时执行 [count]当count改变时执行 不写 每次渲染都会执行
  
  return (
    <div className="min-h-screen">
      <Navbar/>

      {isRateLimited && <RateLimitedUI />}

      <div className="max-w-7xl mx-auto p-4 mt-6">
        {loading && <div className="text-center text-primary py-10">Loading notes...</div>}

        {notes.length > 0 && !isRateLimited && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
            {notes.map((note => (
              <NoteCard key={note._id} note ={note} />
            )))}
          </div>
        )}
    
    
      </div>
    </div>

  )
}

export default HomePage 


//useState 存数据改数据  useEffect 监听变化 做事情  
// 如果你是刚学 React，我给你一个学习顺序
// 第 1 阶段（必须）
// JSX
// 组件
// useState
// 事件（onClick / onChange）
// 第 2 阶段
// useEffect
// fetch / axios
// 条件渲染
// 列表渲染
// 第 3 阶段
// 自定义 hooks
// 表单
// 路由（react-router）
// 如果你现在觉得语法“怪”，通常是 JS 基础还没跟上。
// 至少要会：
// const / let
// 箭头函数 () => {}
// 数组 / 对象
// 解构赋值 const [a, b] = []