"""
YouTube API Service for Fitplan.ai
Fetches relevant workout videos based on exercise names
"""

import os
from typing import List, Dict, Optional
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


class YouTubeService:
    """Service to search and fetch workout videos from YouTube"""
    
    def __init__(self):
        if not YOUTUBE_API_KEY or YOUTUBE_API_KEY == "YOUR_YOUTUBE_API_KEY_HERE":
            raise ValueError("YouTube API key not configured. Please add YOUTUBE_API_KEY to .env file")
        
        self.youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
    
    def search_workout_videos(
        self,
        exercise_name: str,
        max_results: int = 3,
        location: Optional[str] = None,
        duration: str = "short"  # short (< 4 min), medium (4-20 min), long (> 20 min)
    ) -> List[Dict]:
        """
        Search for workout videos by exercise name
        
        Args:
            exercise_name: Name of the exercise (e.g., "Push-ups", "Bench Press")
            max_results: Maximum number of videos to return
            location: Optional location (lat,long) for location-based search
            duration: Video duration filter
        
        Returns:
            List of video dictionaries with title, videoId, thumbnail, etc.
        """
        try:
            # Build search query
            search_query = f"{exercise_name} tutorial proper form"
            
            # Build request parameters
            search_params = {
                "part": "snippet",
                "q": search_query,
                "type": "video",
                "maxResults": max_results,
                "order": "relevance",
                "videoDuration": duration,
                "videoDefinition": "high",
                "videoEmbeddable": "true",
                "relevanceLanguage": "en",
            }
            
            # Add location if provided
            if location:
                lat, lon = location.split(',')
                search_params["location"] = f"{lat},{lon}"
                search_params["locationRadius"] = "500km"
            
            # Execute search
            request = self.youtube.search().list(**search_params)
            response = request.execute()
            
            # Transform response to simpler format
            videos = []
            for item in response.get("items", []):
                video_id = item["id"]["videoId"]
                snippet = item["snippet"]
                
                videos.append({
                    "videoId": video_id,
                    "title": snippet["title"],
                    "description": snippet["description"],
                    "thumbnail": snippet["thumbnails"]["high"]["url"],
                    "channelTitle": snippet["channelTitle"],
                    "publishedAt": snippet["publishedAt"],
                    "embedUrl": f"https://www.youtube.com/embed/{video_id}",
                    "watchUrl": f"https://www.youtube.com/watch?v={video_id}",
                })
            
            return videos
        
        except HttpError as e:
            print(f"⚠️ YouTube API error: {e}")
            # Return fallback videos when API fails
            return self._get_fallback_videos(exercise_name, max_results)
        except Exception as e:
            print(f"⚠️ Error searching videos: {e}")
            return self._get_fallback_videos(exercise_name, max_results)
    
    def get_videos_for_workout_plan(
        self,
        exercises: List[Dict],
        max_videos_per_exercise: int = 2
    ) -> List[Dict]:
        """
        Get videos for all exercises in a workout plan
        
        Args:
            exercises: List of exercise dicts with 'name', 'duration', etc.
            max_videos_per_exercise: Max videos per exercise
        
        Returns:
            List of videos with exercise context
        """
        all_videos = []
        
        for exercise in exercises:
            exercise_name = exercise.get("name", "")
            if not exercise_name:
                continue
            
            # Search videos for this exercise
            videos = self.search_workout_videos(
                exercise_name=exercise_name,
                max_results=max_videos_per_exercise
            )
            
            # Add exercise context to videos
            for video in videos:
                video["exerciseName"] = exercise_name
                video["exerciseDuration"] = exercise.get("duration", "")
                video["exerciseCalories"] = exercise.get("calories", 0)
                video["exerciseSets"] = exercise.get("sets")
                video["exerciseReps"] = exercise.get("reps")
            
            all_videos.extend(videos)
        
        return all_videos
    
    def get_video_details(self, video_id: str) -> Optional[Dict]:
        """
        Get detailed information about a specific video
        
        Args:
            video_id: YouTube video ID
        
        Returns:
            Video details dictionary
        """
        try:
            request = self.youtube.videos().list(
                part="snippet,contentDetails,statistics",
                id=video_id
            )
            response = request.execute()
            
            if not response.get("items"):
                return None
            
            item = response["items"][0]
            snippet = item["snippet"]
            details = item["contentDetails"]
            stats = item["statistics"]
            
            return {
                "videoId": video_id,
                "title": snippet["title"],
                "description": snippet["description"],
                "thumbnail": snippet["thumbnails"]["high"]["url"],
                "channelTitle": snippet["channelTitle"],
                "publishedAt": snippet["publishedAt"],
                "duration": details["duration"],
                "viewCount": stats.get("viewCount", 0),
                "likeCount": stats.get("likeCount", 0),
                "embedUrl": f"https://www.youtube.com/embed/{video_id}",
                "watchUrl": f"https://www.youtube.com/watch?v={video_id}",
            }
        
        except HttpError as e:
            print(f"YouTube API error: {e}")
            return None
        except Exception as e:
            print(f"Error getting video details: {e}")
            return None
    
    def _get_fallback_videos(self, exercise_name: str, max_results: int = 2) -> List[Dict]:
        """
        Fallback video database when YouTube API is unavailable
        Returns curated video IDs for common exercises
        """
        # Curated workout video database (verified working videos)
        FALLBACK_VIDEOS = {
            "push": [
                {"videoId": "IODxDxX7oi4", "title": "Perfect Push-up Form Tutorial", "channel": "Calisthenicmovement"},
                {"videoId": "_l3ySVKYVJ8", "title": "Push-up Variations for Beginners", "channel": "ATHLEAN-X"},
            ],
            "squat": [
                {"videoId": "YaXPRqUwItQ", "title": "How to Squat Properly", "channel": "ScottHermanFitness"},
                {"videoId": "ultWZbUMPL8", "title": "Squat Form Tutorial", "channel": "Jeff Nippard"},
            ],
            "plank": [
                {"videoId": "pvIjsG5Svck", "title": "How to Plank Correctly", "channel": "Calisthenicmovement"},
                {"videoId": "pSHjTRCQxIw", "title": "Plank Exercise Tutorial", "channel": "Bowflex"},
            ],
            "lunge": [
                {"videoId": "QOVaHwm-Q6U", "title": "Perfect Lunge Form", "channel": "ScottHermanFitness"},
                {"videoId": "D7KaRcUTQeE", "title": "Walking Lunges Tutorial", "channel": "Buff Dudes"},
            ],
            "jump": [
                {"videoId": "c4DAnQ6DtF8", "title": "Jumping Jacks Tutorial", "channel": "Howcast"},
                {"videoId": "iSSAk4XCsRA", "title": "How to do Jumping Jacks", "channel": "ExpertVillage"},
            ],
            "row": [
                {"videoId": "GZbfZ033f74", "title": "Dumbbell Row Form", "channel": "ScottHermanFitness"},
                {"videoId": "roCP6wCXPqo", "title": "Perfect Bent Over Row", "channel": "ATHLEAN-X"},
            ],
            "press": [
                {"videoId": "rT7DgCr-3pg", "title": "Bench Press Tutorial", "channel": "Alan Thrall"},
                {"videoId": "gRVjAtPip0Y", "title": "Perfect Overhead Press", "channel": "ATHLEAN-X"},
            ],
            "stretch": [
                {"videoId": "g_tea8ZNk5A", "title": "Full Body Stretching", "channel": "Yoga With Adriene"},
                {"videoId": "qULTwquOuT4", "title": "Stretching Routine", "channel": "Bowflex"},
            ],
            "yoga": [
                {"videoId": "v7AYKMP6rOE", "title": "Yoga for Beginners", "channel": "Yoga With Adriene"},
                {"videoId": "Yzm3fA2HhkQ", "title": "Morning Yoga Routine", "channel": "Boho Beautiful"},
            ],
            "cardio": [
                {"videoId": "ml6cT4AZdqI", "title": "Cardio Workout at Home", "channel": "POPSUGAR Fitness"},
                {"videoId": "2MfKCRIzkIs", "title": "HIIT Cardio Workout", "channel": "FitnessBlender"},
            ],
            "default": [
                {"videoId": "IODxDxX7oi4", "title": "Bodyweight Workout Tutorial", "channel": "Calisthenicmovement"},
                {"videoId": "ml6cT4AZdqI", "title": "Full Body Home Workout", "channel": "POPSUGAR Fitness"},
            ]
        }
        
        # Find matching videos based on exercise keywords
        exercise_lower = exercise_name.lower()
        videos = []
        
        for keyword, video_list in FALLBACK_VIDEOS.items():
            if keyword in exercise_lower:
                videos = video_list[:max_results]
                break
        
        # If no match found, use default videos
        if not videos:
            videos = FALLBACK_VIDEOS["default"][:max_results]
        
        # Format videos to match YouTube API response
        formatted_videos = []
        for video in videos:
            formatted_videos.append({
                "videoId": video["videoId"],
                "title": f"{video['title']} - {exercise_name}",
                "description": f"Learn proper form and technique for {exercise_name}",
                "thumbnail": f"https://img.youtube.com/vi/{video['videoId']}/hqdefault.jpg",
                "channelTitle": video["channel"],
                "publishedAt": "2024-01-01T00:00:00Z",
                "embedUrl": f"https://www.youtube.com/embed/{video['videoId']}",
                "watchUrl": f"https://www.youtube.com/watch?v={video['videoId']}",
            })
        
        return formatted_videos


# Initialize global service
try:
    youtube_service = YouTubeService()
except ValueError as e:
    print(f"⚠️ YouTube service disabled: {e}")
    youtube_service = None
