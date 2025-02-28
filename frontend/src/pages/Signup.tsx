import { SignupComp } from "../components/SignupComp";

export function Signup() {
    return <div className="bg-gradient-to-tr from-slate-950 to-white-950 hover:bg-gradient-to-bl">
        <div>
            <SignupComp type="signup" />
        </div>
    </div>
}