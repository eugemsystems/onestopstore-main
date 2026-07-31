import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { ImFacebook, ImGithub } from "react-icons/im";
import { signIn } from "next-auth/react";

import {
  hasAnySocialLogin,
  isFacebookLoginEnabled,
  isGithubLoginEnabled,
  isGoogleLoginEnabled,
} from "@utils/authSettings";

const BottomNavigation = ({
  or,
  route,
  desc,
  pageName,
  loginTitle,
  storeSetting,
}) => {
  const showGoogle = isGoogleLoginEnabled(storeSetting);
  const showFacebook = isFacebookLoginEnabled(storeSetting);
  const showGithub = isGithubLoginEnabled(storeSetting);
  const showSocial = or && hasAnySocialLogin(storeSetting);

  return (
    <>
      {showSocial && (
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground font-medium">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {showGoogle && (
              <button
                type="button"
                onClick={() =>
                  signIn("google", {
                    callbackUrl: "/user/dashboard",
                    redirect: true,
                  })
                }
                className="flex items-center justify-center gap-3 w-full h-10 px-4 text-sm font-semibold text-muted-foreground bg-background border-2 border-border rounded-lg hover:bg-muted hover:border-border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <FcGoogle className="text-xl" />
                <span>{loginTitle || "Sign Up"} With Google</span>
              </button>
            )}

            {showFacebook && (
              <button
                type="button"
                onClick={() =>
                  signIn("facebook", {
                    callbackUrl: "/user/dashboard",
                    redirect: true,
                  })
                }
                className="flex items-center justify-center gap-3 w-full h-10 px-4 text-sm font-semibold text-white bg-[#1877F2] rounded-lg hover:bg-[#166FE5] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <ImFacebook className="text-xl" />
                <span>{loginTitle || "Sign Up"} With Facebook</span>
              </button>
            )}

            {showGithub && (
              <button
                type="button"
                onClick={() =>
                  signIn("github", {
                    callbackUrl: "/user/dashboard",
                    redirect: true,
                  })
                }
                className="flex items-center justify-center gap-3 w-full h-10 px-4 text-sm font-semibold text-white bg-foreground rounded-lg hover:bg-foreground/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <ImGithub className="text-xl" />
                <span>{loginTitle || "Sign Up"} With Github</span>
              </button>
            )}
          </div>
        </>
      )}

      <div className="text-center mt-8 pb-2">
        <p className="text-muted-foreground text-sm">
          {desc ? "Already have an account?" : "Don't have an account?"}{" "}
          <Link
            href={route}
            className="text-primary hover:text-primary font-semibold hover:underline"
          >
            {pageName}
          </Link>
        </p>
      </div>
    </>
  );
};

export default BottomNavigation;
