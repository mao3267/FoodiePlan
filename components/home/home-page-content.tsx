"use client";

import { useState } from "react";
import { ImageWithFallback } from "@/components/figma/image-with-fallback";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Post {
  id: number;
  author: string;
  avatar: string;
  timestamp: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
}

const mockPosts: Post[] = [
  {
    id: 1,
    author: "Sarah Chen",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    timestamp: "2 hours ago",
    content:
      "Just meal prepped for the entire week! Loving this quinoa bowl with roasted vegetables",
    image:
      "https://images.unsplash.com/photo-1666819691716-827f78d892f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMGJvd2wlMjBmb29kfGVufDF8fHx8MTc2OTYyNzc4OXww&ixlib=rb-4.1.0&q=80&w=1080",
    likes: 24,
    comments: 5,
  },
  {
    id: 2,
    author: "Mike Johnson",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    timestamp: "5 hours ago",
    content:
      "Tried a new pasta recipe tonight. Absolutely delicious! Who wants the recipe?",
    image:
      "https://images.unsplash.com/photo-1704915912471-070dd75619c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGRpbm5lciUyMHBsYXRlfGVufDF8fHx8MTc2OTU5NjQzNnww&ixlib=rb-4.1.0&q=80&w=1080",
    likes: 42,
    comments: 12,
  },
  {
    id: 3,
    author: "Emma Davis",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    timestamp: "1 day ago",
    content: "Sunday brunch goals achieved! Avocado toast with poached eggs",
    image:
      "https://images.unsplash.com/photo-1616902666559-af398792d890?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjBhdm9jYWRvJTIwdG9hc3R8ZW58MXx8fHwxNzY5NTg2NzM3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    likes: 38,
    comments: 8,
  },
  {
    id: 4,
    author: "Alex Park",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    timestamp: "2 days ago",
    content:
      "Quick weeknight dinner: Asian stir-fry with lots of veggies. Ready in 20 minutes!",
    image:
      "https://images.unsplash.com/photo-1761314025701-34795be5f737?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0aXIlMjBmcnl8ZW58MXx8fHwxNzY5NjE4MzQ1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    likes: 31,
    comments: 6,
  },
];

export function HomePageContent() {
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  const handlePost = () => {
    if (newPost.trim()) {
      const post: Post = {
        id: posts.length + 1,
        author: "You",
        avatar:
          "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?w=100",
        timestamp: "Just now",
        content: newPost,
        likes: 0,
        comments: 0,
      };
      setPosts([post, ...posts]);
      setNewPost("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card className="p-4 mb-6">
        <h2 className="mb-4">Share your meal</h2>
        <Textarea
          placeholder="What's cooking?"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          className="mb-3 min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button
            onClick={handlePost}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="size-4 mr-2" />
            Post
          </Button>
        </div>
      </Card>

      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <ImageWithFallback
                  src={post.avatar}
                  alt={post.author}
                  className="size-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold">{post.author}</div>
                  <div className="text-sm text-gray-500">{post.timestamp}</div>
                </div>
              </div>
              <p className="mb-3">{post.content}</p>
            </div>

            {post.image && (
              <ImageWithFallback
                src={post.image}
                alt="Post content"
                className="w-full h-80 object-cover"
              />
            )}

            <div className="p-4 border-t">
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors">
                  <Heart className="size-5" />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
                  <MessageCircle className="size-5" />
                  <span>{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors ml-auto">
                  <Share2 className="size-5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
