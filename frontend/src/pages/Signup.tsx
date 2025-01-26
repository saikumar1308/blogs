import { SignupComp } from "../components/SignupComp";

export function Signup() {
    return <div className="bg-gradient-to-tr from-purple-500 to-pink-500 hover:bg-gradient-to-bl">
        <div>
            <SignupComp type="signup" />
        </div>
    </div>
}