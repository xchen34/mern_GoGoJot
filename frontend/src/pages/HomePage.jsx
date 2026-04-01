import { useState, useEffect } from 'react' 
import Navbar from "../components/Navbar"
import RateLimitedUI from '../components/RateLimitedUI';
import NoteCard from '../components/NoteCard';
//import axios from "axios";
import api from "../lib/axios";  //取代一次次写完整的axios.get那些url 大项目容易出错 普遍做法是单独写一个axios.js 也便于修改
import toast from "react-hot-toast"
import NotesNotFound from "../components/NotesNotFound";
import { decodeJwt } from "../lib/utils";
import { Link } from "react-router-dom";

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
  const token = localStorage.getItem("accessToken");
  const isGuest = decodeJwt(token)?.typ === "guest";
  
  useEffect(() => {
    const fetchNotes = async () => {
      try{
        // const res = await fetch("http://localhost:5001/api/notes");
        // const data = await res.json();
        //上面的步骤可以用axios简化写成
        //const res = await axios.get("http://localhost:5001/api/notes");
        // 单独使用axios.js的instance来写如下
        const res = await api.get("/notes");
        
        console.log(res.data);
        setNotes(res.data);
        setIsRateLimited(false);
      }catch(error){
        console.log("Error fetching notes鸭鸭鸭");
        if (error.response?.status === 429) //arrive rate limit
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

      {isGuest && (
        <div className="max-w-7xl mx-auto p-4 mt-6">
          <div className="card bg-base-100 border-t-4 border-solid border-[#00FF9D] shadow">
            <div className="card-body py-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="text-sm uppercase tracking-wider text-base-content/60">
                    Guest Session
                  </div>
                  <h3 className="text-lg font-semibold">
                    You can create only 1 note, and guest notes are not saved.
                  </h3>
                  <p className="text-sm text-base-content/70">
                    To unlock full access and keep your notes, please sign up or sign in.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link to="/signup" className="btn btn-primary">
                    Sign Up
                  </Link>
                  <Link to="/login" className="btn btn-outline">
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRateLimited && <RateLimitedUI />}

      <div className="max-w-7xl mx-auto p-4 mt-6">
        {loading && <div className="text-center text-primary py-10">Loading notes...</div>}

        {!loading && notes.length === 0 && !isRateLimited && <NotesNotFound />}

        {notes.length > 0 && !isRateLimited && (
          <div>
            {notes.length > 50 && (
              <div className="alert alert-info mb-4">
                <span>Showing 50 of {notes.length} notes</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
              {notes.slice(0, 50).map((note => (
                <NoteCard key={note._id} note ={note} setNotes={setNotes}/>
              )))}
            </div>
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
