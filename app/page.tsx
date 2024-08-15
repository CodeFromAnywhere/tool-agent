"use client";
import { Suspense } from "react";
import { StoreProvider } from "./store";
import { Overview } from "./Overview";
import { Form } from "./Form";
import "react-openapi-form/css.css";

const HomePage = () => {
  return (
    <StoreProvider>
      <div className="h-full p-4 lg:px-32 lg:py-20">
        <h1 className="text-3xl">Agent OpenAPI</h1>
        <p>Make your agents available as tools</p>

        <iframe
          src="https://ghbtns.com/github-btn.html?user=codefromanywhere&repo=agent-openapi&type=star&count=true&size=large"
          frameBorder="0"
          scrolling="0"
          width="170"
          height="46"
          className="my-2 p-2 bg-white rounded-md"
          title="GitHub"
        ></iframe>

        <Overview />

        <Form />
      </div>
    </StoreProvider>
  );
};

export default function SuspensedHomepage() {
  // Needed for https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
  return (
    <Suspense>
      <HomePage />
    </Suspense>
  );
}
