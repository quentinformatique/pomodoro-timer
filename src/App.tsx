import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import {Home} from "./Views/Home/Home";
import {Settings} from "./Views/Components/Settings/Settings";
import { Guide } from './Views/Components/Guide/Guide';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/guide" element={<Guide />} />
            </Routes>
        </Router>
    );
}