import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Wifi, Plus, Clock, Loader2 } from "lucide-react";
import { getLocationById, getReviewsForLocation, addReview } from "@/lib/data";
import { useApp } from "@/context/AppContext";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/constants";
import { formatDate } from "@/lib/utils";
import NetworkCard from "@/components/features/NetworkCard";
import type { Location, Review } from "@/types";

export default function LocationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, addToast } = useApp();

  const [location, setLocation] = useState<Location | undefined>(undefined);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingLoc, setLoadingLoc] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoadingLoc(true);
    Promise.all([getLocationById(id), getReviewsForLocation(id)]).then(([loc, revs]) => {
      setLocation(loc);
      setReviews(revs);
      setLoadingLoc(false);
    });
  }, [id]);

  if (loadingLoc) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">Location not found</p>
          <button onClick={() => navigate("/")} className="btn-primary mt-4">Go Back</button>
        </div>
      </div>
    );
  }

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  const handleReview = async () => {
    if (!user) { addToast("warning", "Please sign in to leave a review"); return; }
    if (!comment.trim()) { addToast("error", "Please enter a comment"); return; }
    setSubmitting(true);
    const rev = await addReview({ location_id: location.id, user_id: user.id, user_name: user.full_name, rating, comment });
    setReviews((prev) => [rev, ...prev]);
    setComment("");
    setRating(5);
    setShowReviewForm(false);
    addToast("success", "Review added!");
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-4 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Header */}
      <div className="glass-card p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 flex-shrink-0 bg-white/5 rounded-xl flex items-center justify-center text-3xl">
            {CATEGORY_ICONS[location.category]}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <h1 className="font-bold text-xl">{location.name}</h1>
              {avgRating && (
                <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-2.5 py-1">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-semibold text-yellow-400">{avgRating}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <MapPin size={12} />
              <span>{location.address}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-muted-foreground">
                {CATEGORY_LABELS[location.category]}
              </span>
              <span className="text-xs text-muted-foreground">{reviews.length} reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* WiFi Networks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Wifi size={16} className="text-cyan-400" />
            WiFi Networks ({location.wifi_networks?.length || 0})
          </h2>
          {user && (
            <button onClick={() => navigate(`/add-wifi?location=${location.id}`)} className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
              <Plus size={12} /> Add Network
            </button>
          )}
        </div>
        <div className="space-y-2">
          {location.wifi_networks?.map((net) => (
            <NetworkCard key={net.id} network={net} />
          ))}
          {(!location.wifi_networks || location.wifi_networks.length === 0) && (
            <div className="glass-card p-6 text-center">
              <Wifi size={24} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No WiFi networks added yet</p>
              <button onClick={() => navigate("/add-wifi")} className="btn-primary mt-3 text-sm">Add First Network</button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Star size={16} className="text-yellow-400" />
            Reviews ({reviews.length})
          </h2>
          <button onClick={() => setShowReviewForm(!showReviewForm)} className="text-xs text-cyan-400 hover:text-cyan-300">
            + Write Review
          </button>
        </div>

        {showReviewForm && (
          <div className="glass-card p-4 mb-3 animate-fade-in space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rating:</span>
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className={s <= rating ? "text-yellow-400" : "text-muted-foreground"}>
                  <Star size={18} fill={s <= rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience…"
              rows={3}
              className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
            <div className="flex gap-2">
              <button onClick={handleReview} disabled={submitting} className="btn-primary py-1.5 text-sm disabled:opacity-60">
                {submitting ? "Submitting…" : "Submit"}
              </button>
              <button onClick={() => setShowReviewForm(false)} className="btn-ghost py-1.5 text-sm text-muted-foreground">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {reviews.map((rev) => (
            <div key={rev.id} className="glass-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-semibold text-white">
                    {rev.user_name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{rev.user_name}</div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={10} className={s <= rev.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock size={10} />
                  {formatDate(rev.created_at)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{rev.comment}</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="glass-card p-4 text-center">
              <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
