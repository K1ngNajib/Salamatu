import React, { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { logout, setSocketConnection, setUser } from "../redux/userSlice";
import SideBar from "../components/SideBar";
import logo from "../assets/commandlink-logo.svg";
import io from "socket.io-client";
import { setOnlineUser } from "../redux/userSlice";

const Home = () => {
    //const user = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector(state => state?.user);

    const [loading, setLoading] = useState(true); // Estado para evitar render prematuro

    const fetchUserDetails = useCallback(async () => {
        try {
            const URL = `${process.env.REACT_APP_BACKEND_URL}/api/user-details`;
            const response = await axios({
                url : URL,
                withCredentials : true
            });

            if (response.data.data.logout) {
                dispatch(logout());
                navigate('/email');
            } else {
                dispatch(setUser(response.data.data));
            }
        } catch (error) {
            console.log("error fetching user", error);
            dispatch(logout());
            navigate('/register');
        } finally {
            setLoading(false); // avoid a blank render
        }
    }, [dispatch, navigate]);

    // check if the user is authenticated
    useEffect(() => {
        fetchUserDetails();
    }, [fetchUserDetails]);

    useEffect(() => {
        if (!loading && !user?._id && location.pathname !== "/register") {
            navigate("/register");
        }
    }, [loading, user, location.pathname, navigate]);

    /** socket connection **/
    useEffect(() => {
        if (!loading) {
            const socketConnection = io(process.env.REACT_APP_BACKEND_URL, {
                auth : {
                    token : localStorage.getItem('token')
                }
            })
    
            socketConnection.on('online-user', (data) => {
                console.log('online-user', data);
                dispatch(setOnlineUser(data));
            })
    
            dispatch(setSocketConnection(socketConnection));
    
            return () => {
                socketConnection.disconnect();
            }
        }
    },[dispatch, loading]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg text-gray-600">Loading...</p>
            </div>
        );
    }

    const basePath = location.pathname === '/'
  return (
    <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen'>
        <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
           <SideBar/>
        </section>

        {/**message component**/}
        <section className={`${basePath && "hidden"}`} >
            <Outlet/>
        </section>


        <div className={`justify-center items-center flex-col gap-2 hidden ${!basePath ? "hidden" : "lg:flex" }`}>
            <div>
              <h2 className='text-2xl font-bold text-slate-700 text-center mb-3'>CommandLink</h2>
              <img
                src={logo}
                width={250}
                alt='logo'
              />
            </div>
            <p className='text-lg mt-2 text-slate-500'>Select a channel, order, or user to start secure command communications</p>
        </div>
    </div>
  )
}

export default Home;