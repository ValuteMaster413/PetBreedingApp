import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {AuthProvider} from "./context/AuthContext";
import LoginForm from "../features/ auth/LoginForm";
import RegisterForm from "../features/ auth/RegisterForm";
import PrivateRoute from "./routes/PrivateRoute";
import Profile from "../features/profile/pages/Profile";
import MatchSwiper from "../features/match/MatchSwiper";
import PetProfile from "../features/pets/PetProfile";

import OtherProfile from "../features/user/OtherProfile";
import ChatList from "../features/chats/ChatList";
import ChatRoom from "../features/chats/ChatRoom";

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
