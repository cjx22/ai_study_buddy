import React from "react";
import { useLocation } from "react-router-dom";
import "../App.css"; // or later make Feed.css

interface LocationState {
  content?: string;
}

function Feed() {
  const location = useLocation();
  const state = location.state as LocationState;
  const content = state?.content || "No content provided";

  return (
    <div className="feed-container">
      <h2>Study Feed</h2>
      <p>{content}</p>
    </div>
  );
}

export default Feed;
