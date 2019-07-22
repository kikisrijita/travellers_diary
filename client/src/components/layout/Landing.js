import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <section className="landing">
      <div className="dark-overlay">
        <div class="container" id="container">
          <div class="form-container sign-container">
            <form action="#" className="formfirst">
              <i class="fas fa-pen-fancy fa-3x" />{" "}
              <i class="fas fa-signature signature" />
              <p className="space">
                <i class="fas fa-quote-left fa-2x" />
                Separated by states United by Traveller's Diary
                <i class="fas fa-quote-right fa-2x" />
              </p>
              <Link to="/register">
                <button className="btn-primary">
                  <i class="fas fa-sign-in-alt fa-2x" /> Sign up
                </button>
              </Link>
              <span className="already">already have an account?</span>
              <Link to="/login">Sign In</Link>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Landing;
