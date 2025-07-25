import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { allPost_API, post_API, profile_APi } from '../utils/constant'
import parse from 'html-react-parser';
import TipTapEditor from '../components/TipTapEditor';
import { FaUserCircle } from "react-icons/fa";
import he from'he'
import AuthContext from '../context/AuthContext';
import Quill from '../components/Quill';

const Profile = () => {
  const token = localStorage.getItem("authorization");
  const userId = localStorage.getItem("userId");
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const navigate = useNavigate();
  const [isShow,setIshow] = useState(true)
  const {logout} = useContext(AuthContext)
  const handleLogout = () => {
    logout()
    navigate("/login");
  };

  const fetchUserData = async () => {
    try {
      const res = await fetch(profile_APi, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json"
        }
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const res = await fetch(`${allPost_API}/${userId}`, {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json"
        }
      });
      if (!res.ok) throw new Error("Failed to fetch posts");
      const posts = await res.json();
      setUserPosts(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchPostDelete = async (id) => {
    try {
      const res = await fetch(`${post_API}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
          "Content-Type": "application/json"
        }
      });
      if (!res.ok) throw new Error("Failed to delete post");
      fetchUserPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const fetchPostEdit = async (id) => {
    try {
      const res = await fetch(`${post_API}/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent
        })
      });
      if (!res.ok) throw new Error("Failed to update post");
      setEditingPostId(null);
      fetchUserPosts();
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchUserPosts()
  }, []);

  if(!token){
    // alert('Please Login first.')
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col md:mx-40  text-white py-10 gap-10">
      <div className="flex flex-col items-center">
        {
          userData?.data?.image ? (
            <img src={userData?.data?.image} alt=""  className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover mx-auto border border-cyan-400"/>
          ):
          (
            <FaUserCircle className="text-cyan-600 w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto" />
          )
        }    
        <div>
          <h1 className="text-xl sm:text-2xl font-bold mt-6 flex justify-center flex-wrap">
            {isLoading ? (
              <div className="w-32 h-5 bg-gray-700 rounded-md animate-pulse mx-2"></div>
            ) : (
              <span className="text-cyan-400 mx-2">{userData?.data?.name}</span>
            )}
          </h1>

          <h2 className="text-base sm:text-xl mt-3 flex justify-center flex-wrap">
            {isLoading ? (
              <div className="w-44 h-5 bg-gray-700 rounded-md animate-pulse mx-2"></div>
            ) : (
              <a href="mailto:cpsaw999041@gmail.com"><span className="text-gray-300 mx-2">{userData?.data?.email}</span></a>
            )}
          </h2>

          <button 
            className="mt-8 mx-16 bg-red-600 hover:bg-red-700 transition-all duration-300 text-white items-center text-lg font-semibold px-6 py-3 rounded-lg shadow-lg active:scale-95 cursor-pointer"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
        <section className="px-2 mx-4">
          <div className="w-full flex justify-center my-6">
            <div className="flex bg-gradient-to-r from-black to-cyan-900 p-1 rounded-full shadow-lg w-fit">
              <button
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  isShow ? 'bg-cyan-500 text-black shadow-md' : 'text-white hover:text-cyan-400'
                }`}
                onClick={() => setIshow(true)}
              >
                Posts
              </button>
              <button
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  !isShow ? 'bg-cyan-500 text-black shadow-md' : 'text-white hover:text-cyan-400'
                }`}
                onClick={() => setIshow(false)}
              >
                Saved
              </button>
            </div>
          </div>

          {isShow ? <div className="mt-6 space-y-4  bg-opacity-40 rounded-lg"> 
            {userPosts.length === 0 ? (
              <p className="text-gray-400 text-center">No posts found.</p>
            ) : (
              userPosts.map((post) => (
                <div key={post._id} className="p-4 bg-gray-900 rounded-md border border-gray-700 shadow-md w-full">
                  {editingPostId === post._id ? (
                    <>
                      <input 
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full mb-2 p-2 bg-gray-700 rounded text-white"
                      />
                      <Quill content={editContent} setContent={setEditContent} />
                      <div className="flex justify-between mt-2">
                        <button
                          className="px-4 py-1 bg-gray-700 rounded cursor-pointer active:scale-95"
                          onClick={() => fetchPostEdit(post._id)}
                        >
                          Save
                        </button>
                        <button
                          className="px-2 py-1 bg-red-600 rounded cursor-pointer active:scale-95"
                          onClick={() => setEditingPostId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='flex justify-between'>
                        <div>
                          <h3 className="text-lg  font-semibold">{post.title}</h3>
                          <h3>{parse(he.decode(post.content.slice(0,150)))}...</h3>
                        </div>
                      <img src={post.image[0]} alt="image" className='rounded-md w-40 h-20'/>
                      </div>
                      
                      <div className="flex justify-between mt-2">
                        <button 
                          className=" px-4 py-2 bg-gray-700 rounded-md cursor-pointer active:scale-95"
                          onClick={() => {
                            setEditingPostId(post._id);
                            setEditTitle(post.title);
                            setEditContent(post.content);
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="p-1 px-2 bg-red-600 rounded-md cursor-pointer hover:bg-red-500 active:scale-95"
                          onClick={() => fetchPostDelete(post._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div> : 
          <div>
            {/* {savePost} */}
            <p className='text-center text-gray-400'>No saved post</p>
          </div>
          }
        </section>
     
    </div>
  );
};

export default Profile;
