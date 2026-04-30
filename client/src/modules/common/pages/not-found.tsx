import { Link } from "react-router";

import PageMeta from "./page-meta";
import useGoBack from "../hooks/use-go-back";

const NotFound: React.FC = () => {
  const goBack = useGoBack();
  return (
    <>
      <PageMeta title="sofIA - 404" description="This page not found" />
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
        <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
          <h1 className="mb-8 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
            404
          </h1>
          {/* 
          <img src="/images/error/404.svg" alt="" className="dark:hidden" />
          <img
            src="/images/error/404-dark.svg"
            alt=""
            className="hidden dark:block"
          /> */}
          <div className="flex gap-6 items-center justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              Home
            </Link>

            <button
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              onClick={goBack}
            >
              Back
            </button>
          </div>
        </div>
        {/* <!-- Footer --> */}
        <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
          &copy; {new Date().getFullYear()} - sofIA
        </p>
      </div>
    </>
  );
};

export default NotFound;
