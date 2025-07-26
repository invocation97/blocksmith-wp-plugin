import { BlockContent, blockSchema } from "../schemas/blockSchema";
import { apiClient } from "./api";

export const generateBlock = async (post: {
  title: string;
  content: string;
}): Promise<BlockContent | null> => {
  try {
    const result = await apiClient.generateContent("", {
      postTitle: post.title,
      postContent: post.content,
      // format: "block",
      // style: "professional",
    });

    if (!result.success) {
      throw new Error(result.data.message);
    }

    return blockSchema.parse(result.data);
  } catch (error) {
    console.error("Block generation error:", error);
    return null;
  }
};
