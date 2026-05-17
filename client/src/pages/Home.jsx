import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const Icon = ({ children, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

const IconBolt = ({ className = "" }) => (
  <Icon className={className}>
    <path d="M13 2L4 14h7l-1 8 10-14h-7z" />
  </Icon>
);

const IconPipe = ({ className = "" }) => (
  <Icon className={className}>
    <path d="M8 6h6a3 3 0 013 3v2" />
    <path d="M17 11h-6a3 3 0 00-3 3v4" />
  </Icon>
);

const IconBrush = ({ className = "" }) => (
  <Icon className={className}>
    <path d="M14 3l7 7-7 7-7-7z" />
  </Icon>
);

const IconSnowflake = ({ className = "" }) => (
  <Icon className={className}>
    <path d="M12 2v20" />
    <path d="M4.5 6.5l15 11" />
    <path d="M19.5 6.5l-15 11" />
  </Icon>
);

const workerIconMap = {
  Electrician: IconBolt,
  Plumber: IconPipe,
  Painter: IconBrush,
  "AC Technician": IconSnowflake,
};

const ALL_WORKERS = [
  {
    id: 1,
    name: "John Doe",
    profession: "Electrician",
    rating: 4.8,
    price: "$40/hr",
    available: true,
  },
  {
    id: 2,
    name: "Jane Smith",
    profession: "Plumber",
    rating: 4.9,
    price: "$50/hr",
    available: false,
  },
  {
    id: 3,
    name: "Ravi Kumar",
    profession: "Painter",
    rating: 4.6,
    price: "$30/hr",
    available: true,
  },
  {
    id: 4,
    name: "Amit Sharma",
    profession: "AC Technician",
    rating: 4.7,
    price: "$45/hr",
    available: true,
  },
];

const Home = () => {
  const [workers, setWorkers] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    setWorkers(ALL_WORKERS);
  }, []);

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[36px] overflow-hidden shadow-2xl min-h-[500px]">
            <img
              src="/hero-section.png"
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center">
              <div className="text-white max-w-3xl px-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
                  {t("heroTitle")}
                </h1>

                <p className="mt-6 text-lg text-slate-200">
                  Book verified electricians, plumbers, cleaners,
                  painters and more instantly.
                </p>

                <div className="mt-8 flex justify-center gap-4 flex-wrap">
                  <Link
                    to="/services"
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold"
                  >
                    Find Workers
                  </Link>

                  <Link
                    to="/worker-register"
                    className="bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold"
                  >
                    Become a Worker
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: "10K+", label: "Happy Customers" },
            { number: "500+", label: "Verified Workers" },
            { number: "24/7", label: "Support" },
            { number: "4.9★", label: "Average Rating" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-8 text-center shadow-sm border flex flex-col justify-center min-h-[180px]"
            >
              <h3 className="text-4xl font-extrabold text-slate-900">
                {item.number}
              </h3>

              <p className="mt-2 text-slate-600">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED WORKERS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-extrabold text-slate-900">
                Featured Professionals
              </h2>

              <p className="text-slate-600 mt-3">
                Trusted experts ready to help you.
              </p>
            </div>

            <Link
              to="/services"
              className="text-blue-600 font-semibold hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {workers.map((worker) => {
              const WorkerIcon =
                workerIconMap[worker.profession] || IconBolt;

              return (
                <div
                  key={worker.id}
                  className="bg-white border rounded-3xl p-6 shadow-sm hover:shadow-xl transition flex flex-col h-full"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <WorkerIcon className="w-8 h-8 text-slate-900" />
                    </div>

                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        worker.available
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {worker.available ? "Available" : "Busy"}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-900">
                    {worker.name}
                  </h3>

                  <p className="text-blue-600 font-medium mt-1">
                    {worker.profession}
                  </p>

                  <div className="flex items-center justify-between mt-5 text-sm mb-6">
                    <span>⭐ {worker.rating}</span>
                    <span className="font-semibold">
                      {worker.price}
                    </span>
                  </div>

                  <Link
                    to={`/worker/${worker.id}`}
                    className="mt-auto block text-center bg-slate-900 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition"
                  >
                    Book Now
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold text-slate-900">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mt-16 items-stretch">
            {[
              {
                step: "1",
                title: "Search Services",
                desc: "Find trusted professionals near you.",
              },
              {
                step: "2",
                title: "Book Instantly",
                desc: "Choose your preferred date and time.",
              },
              {
                step: "3",
                title: "Get It Done",
                desc: "Relax while experts complete the work.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-3xl p-10 border shadow-sm flex flex-col items-center text-center h-full"
              >
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                  {item.step}
                </div>

                <h3 className="mt-6 text-2xl font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-3 text-slate-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-blue-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-6 flex flex-col items-center">
          <h2 className="text-5xl font-extrabold">
            Need Help Today?
          </h2>

          <p className="mt-5 text-lg text-blue-100">
            Hire trusted professionals in minutes.
          </p>

          <Link
            to="/services"
            className="inline-block mt-8 bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold"
          >
            Explore Services
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;