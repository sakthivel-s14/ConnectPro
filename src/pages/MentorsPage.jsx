import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MentorsPage.css";
import { FiSearch, FiArrowRight, FiStar, FiUser, FiArrowLeft, FiCheck, FiMessageSquare } from "react-icons/fi";
import { getStoredProviders, getAuth } from "../utils/storage";


export default function MentorsPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const homeRoute = auth?.role === "provider" ? "/provider-home" : "/user-home";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const defaultMentors = [
    {
      id: 1,
      email: "sarah.johnson@connectpro.com",
      name: "Sarah Johnson",
      title: "Senior Frontend Developer",
      rating: 4.9,
      reviews: 234,
      hourlyRate: 50,
      expertise: ["React", "TypeScript", "UI/UX"],
      bio: "10+ years experience in frontend development with focus on React and modern web technologies.",
      category: "frontend",
      availability: "Available now",
    },
    {
      id: 2,
      email: "alex.chen@connectpro.com",
      name: "Alex Chen",
      title: "Full Stack Engineer",
      rating: 4.8,
      reviews: 189,
      hourlyRate: 60,
      expertise: ["Node.js", "React", "AWS"],
      bio: "Expert in building scalable web applications with modern tech stack.",
      category: "fullstack",
      availability: "Available in 2 hours",
    },
    {
      id: 3,
      email: "emma.davis@connectpro.com",
      name: "Emma Davis",
      title: "Product Manager",
      rating: 4.7,
      reviews: 156,
      hourlyRate: 70,
      expertise: ["Product Strategy", "Leadership", "Analytics"],
      bio: "Led product teams at top tech companies. Specializing in product strategy and growth.",
      category: "product",
      availability: "Available today",
    },
    {
      id: 4,
      email: "raj.patel@connectpro.com",
      name: "Raj Patel",
      title: "Backend Architect",
      rating: 4.9,
      reviews: 267,
      hourlyRate: 65,
      expertise: ["Microservices", "System Design", "Python"],
      bio: "Specialized in designing robust backend systems for scale.",
      category: "backend",
      availability: "Available tomorrow",
    },
    {
      id: 5,
      email: "lisa.wong@connectpro.com",
      name: "Lisa Wong",
      title: "UX/UI Designer",
      rating: 4.6,
      reviews: 198,
      hourlyRate: 45,
      expertise: ["Figma", "Design Systems", "User Research"],
      bio: "Creative designer focused on user-centered design and beautiful interfaces.",
      category: "design",
      availability: "Available now",
    },
    {
      id: 6,
      email: "james.wilson@connectpro.com",
      name: "James Wilson",
      title: "DevOps & Cloud Engineer",
      rating: 4.8,
      reviews: 142,
      hourlyRate: 70,
      expertise: ["Docker", "Kubernetes", "AWS"],
      bio: "Expert in cloud infrastructure and DevOps best practices.",
      category: "devops",
      availability: "Available in 1 hour",
    },
  ];

  const mentors = useMemo(() => {
    const storedProviders = getStoredProviders();
    if (storedProviders.length === 0) return defaultMentors;

    return storedProviders.map((provider, index) => ({
      id: provider.email,
      email: provider.email,
      name: provider.name,
      title: provider.skills || "Expert Mentor",
      rating: 4.8,
      reviews: 32 + index * 5,
      hourlyRate: 50,
      expertise: provider.skills ? provider.skills.split(",").map((skill) => skill.trim()) : ["Mentoring"],
      bio: provider.experience || "Experienced mentor.",
      category: "provider",
      availability: "Available now",
    }));
  }, []);

  const categories = [
    { id: "all", label: "All Mentors" },
    { id: "frontend", label: "Frontend" },
    { id: "backend", label: "Backend" },
    { id: "fullstack", label: "Full Stack" },
    { id: "design", label: "Design" },
    { id: "product", label: "Product" },
    { id: "devops", label: "DevOps" },
  ];

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.expertise.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory = selectedCategory === "all" || mentor.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBookMentor = (mentorId) => {
    localStorage.setItem("selectedMentor", JSON.stringify(mentors.find(m => m.id === mentorId)));
    navigate("/booking");
  };

  return (
    <div className="mentors-page">

      {/* HEADER */}
      <div className="mentors-header">
        <button className="back-btn" onClick={() => navigate(homeRoute)}>
          <FiArrowLeft size={16} /> Back
        </button>
        <div className="mentors-title-block">
          <h1>Find Your Perfect Mentor</h1>
          <p>Connect with experienced professionals and accelerate your career growth</p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="mentors-search-container">
        <div className="search-box">
          <FiSearch className="search-icon" size={17} />
          <input
            type="text"
            placeholder="Search mentors by name, title, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div className="category-filter">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? "active" : ""}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* MENTORS GRID */}
      <div className="mentors-grid">
        {filteredMentors.length > 0 ? (
          filteredMentors.map((mentor) => (
            <div key={mentor.id} className="mentor-card">

              {/* TOP: Avatar + Name + Title + Rating */}
              <div className="mentor-card-top">
                <div className="mentor-avatar">
                  <FiUser size={20} />
                </div>
                <div className="mentor-identity">
                  <h3 className="mentor-name">{mentor.name}</h3>
                  <p className="mentor-title">{mentor.title}</p>
                  <div className="rating-section">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          size={13}
                          className={i < Math.floor(mentor.rating) ? "star-filled" : "star"}
                        />
                      ))}
                    </div>
                    <span className="rating-text">
                      {mentor.rating} ({mentor.reviews})
                    </span>
                  </div>
                </div>
              </div>

              {/* BIO */}
              <p className="mentor-bio">{mentor.bio}</p>

              {/* EXPERTISE TAGS */}
              <div className="expertise-tags">
                {mentor.expertise.map((skill, idx) => (
                  <span key={idx} className="skill-tag">{skill}</span>
                ))}
              </div>

              {/* AVAILABILITY */}
              <div className="availability">
                <span className="availability-status">
                  <FiCheck size={13} /> {mentor.availability}
                </span>
              </div>

              {/* FOOTER: PRICE + BUTTONS */}
              <div className="mentor-footer">
                <div className="price">
                  <span className="amount">${mentor.hourlyRate}</span>
                  <span className="unit">/hour</span>
                </div>
                <div className="mentor-card-actions">
                  {mentor.email && (
                    <button
                      className="mentor-profile-btn"
                      onClick={() => navigate(`/provider-profile/${encodeURIComponent(mentor.email)}`)}
                      title="View mentor profile"
                    >
                      View Profile
                    </button>
                  )}
                  <button className="book-btn" onClick={() => handleBookMentor(mentor.id)}>
                    Book <FiArrowRight size={13} />
                  </button>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="no-results">
            <FiUser size={36} />
            <p>No mentors found matching your criteria</p>
            <button className="reset-btn" onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
            }}>
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
