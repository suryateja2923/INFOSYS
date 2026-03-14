import React, { useState, useEffect } from 'react';
import { FitnessCard } from '@/components/ui/FitnessCard';
import { FitnessInput } from '@/components/ui/FitnessInput';
import { useFitplanStore } from '@/store/fitplanStore';
import { Play, Search, RefreshCw, Clock, Flame, TrendingUp, ExternalLink, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { videoAPI } from '@/lib/api';

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  embedUrl: string;
  watchUrl: string;
  exerciseName?: string;
  exerciseDuration?: string;
  exerciseCalories?: number;
  exerciseSets?: number;
  exerciseReps?: number;
}

const WorkoutVideosPage: React.FC = () => {
  const { currentDay, workoutMode } = useFitplanStore();
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load videos for current day's workout
  useEffect(() => {
    loadWorkoutVideos();
  }, [currentDay]);

  const loadWorkoutVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await videoAPI.getWorkoutVideos(currentDay);
      setVideos(response.videos || []);
      setExercises(response.exercises || []);
      console.log(`✅ Loaded ${response.videos?.length || 0} videos for day ${currentDay}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load videos';
      setError(errorMsg);
      console.error('Failed to load workout videos:', err);
      
      // If no workout plan exists, show friendly message
      if (errorMsg.includes('No workout plan found')) {
        setError('Generate a workout plan first to see relevant videos');
      } else if (errorMsg.includes('YouTube service not available')) {
        setError('YouTube integration is not configured. Please add YOUTUBE_API_KEY to backend .env');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Search videos
  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await videoAPI.searchVideos(searchQuery, 6);
      setSearchResults(response.videos || []);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search on Enter key
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const displayVideos = searchQuery && searchResults.length > 0 ? searchResults : videos;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-3xl font-bold">Workout Videos</h1>
        <p className="text-muted-foreground mt-1">
          Learn proper form and techniques for your exercises • Day {currentDay}
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1">
          <FitnessInput
            type="text"
            placeholder="Search for workout videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery}
          className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {isSearching ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
              Searching...
            </>
          ) : (
            'Search'
          )}
        </button>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}
            className="px-4 py-2 rounded-xl bg-muted hover:bg-accent transition-all"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <FitnessCard className="bg-destructive/10 border-destructive/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Unable to load videos</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </FitnessCard>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading workout videos...</p>
        </div>
      )}

      {/* Today's Workout Videos */}
      {!isLoading && !error && !searchQuery && videos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Videos for Day {currentDay} Workout</h2>
            <Badge variant="secondary">{workoutMode === 'gym' ? 'Gym' : 'Home'}</Badge>
            <Badge variant="outline">{exercises.length} exercises</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayVideos.map((video, index) => (
              <VideoCard
                key={`${video.videoId}-${index}`}
                video={video}
                onClick={() => setSelectedVideo(video)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchQuery && searchResults.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Search Results for "{searchQuery}"</h2>
            <Badge variant="secondary">{searchResults.length} videos</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((video, index) => (
              <VideoCard
                key={`${video.videoId}-${index}`}
                video={video}
                onClick={() => setSelectedVideo(video)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && videos.length === 0 && !searchQuery && (
        <FitnessCard className="text-center py-12">
          <Play className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2">No videos available</h3>
          <p className="text-muted-foreground mb-4">
            Generate a workout plan for Day {currentDay} to see relevant videos
          </p>
        </FitnessCard>
      )}

      {/* No Search Results */}
      {searchQuery && searchResults.length === 0 && !isSearching && (
        <FitnessCard className="text-center py-12">
          <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2">No results found</h3>
          <p className="text-muted-foreground">
            Try searching with different keywords
          </p>
        </FitnessCard>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

// Video Card Component
const VideoCard: React.FC<{
  video: YouTubeVideo;
  onClick: () => void;
}> = ({ video, onClick }) => {
  return (
    <FitnessCard 
      className="group cursor-pointer hover:scale-[1.02] transition-all duration-200"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-lg mb-3">
        <img 
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-16 h-16 text-white" />
        </div>
        {video.exerciseName && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-black/70 text-white border-white/20">
              {video.exerciseName}
            </Badge>
          </div>
        )}
      </div>
      <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
        {video.channelTitle}
      </p>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3 text-muted-foreground">
          {video.exerciseDuration && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {video.exerciseDuration}
            </span>
          )}
          {video.exerciseCalories && video.exerciseCalories > 0 && (
            <span className="flex items-center gap-1">
              <Flame className="w-4 h-4" />
              {video.exerciseCalories} cal
            </span>
          )}
        </div>
        {video.exerciseSets && video.exerciseReps && (
          <Badge variant="outline">
            {video.exerciseSets}×{video.exerciseReps}
          </Badge>
        )}
      </div>
    </FitnessCard>
  );
};

// Video Player Modal Component
const VideoPlayerModal: React.FC<{
  video: YouTubeVideo;
  onClose: () => void;
}> = ({ video, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{video.title}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span>{video.channelTitle}</span>
              {video.exerciseName && (
                <Badge variant="secondary">{video.exerciseName}</Badge>
              )}
              {video.exerciseDuration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {video.exerciseDuration}
                </span>
              )}
              {video.exerciseCalories && video.exerciseCalories > 0 && (
                <span className="flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  {video.exerciseCalories} calories
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-2xl font-bold ml-4"
          >
            ×
          </button>
        </div>
        
        <div className="aspect-video rounded-lg overflow-hidden bg-black mb-4">
          <iframe
            width="100%"
            height="100%"
            src={`${video.embedUrl}?autoplay=1`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        {video.description && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {video.description}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <a
            href={video.watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Watch on YouTube
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-muted hover:bg-accent transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutVideosPage;
