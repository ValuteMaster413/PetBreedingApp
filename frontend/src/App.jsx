import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {AuthProvider} from "./store/AuthContext";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import PrivateRoute from "./routes/PrivateRoute";
import Profile from "./components/Profile/Profile";
import MatchSwiper from "./pages/MatchSwiper";
import PetProfile from "./pages/PetProfile";

import OtherProfile from "./components/Profile/OtherProfile";
import ChatList from "./components/Chats/ChatList";
import ChatRoom from "./components/Chats/ChatRoom";

const App = () => (
    <AuthProvider>
        <Router>
            <Routes>
                <Route path="/login" element={<LoginForm/>}/>
                <Route path="/register" element={<RegisterForm/>}/>
                <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>}/>
                <Route path="/match/:pet_id" element={<MatchSwiper/>}/>

                <Route path="/pets/:petId" element={<PetProfile/>}/>
                <Route path="/profile/:userId" element={<OtherProfile />} />
                <Route path="/chats" element={<ChatList />} />
                <Route path="/chats/:chatId" element={<ChatRoom />} />


            </Routes>
        </Router>
    </AuthProvider>
);

export default App;
