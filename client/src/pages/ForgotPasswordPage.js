import React from "react";
import commandLinkLogo from "../assets/commandlink-logo.svg";

const ForgotPassword = () => {
    return (
        <div className="flex justify-center mt-4">
            {/* CommandLink branded placeholder while forgot-password workflow is being expanded. */}
            <img
                src={commandLinkLogo}
                alt="CommandLink Logo"
                style={{ maxWidth: "40%", height: "auto" }}
            />
        </div>
    );
}

export default ForgotPassword;
