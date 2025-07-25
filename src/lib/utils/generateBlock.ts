import { BlockContent, blockSchema } from "../schemas/blockSchema";
import apiFetch from "./api";

export const generateBlock = async (
  token: string,
  post: {
    title: string;
    content: string;
  }
): Promise<BlockContent | null> => {
  try {
    const { data, error } = await apiFetch("/agent/generate", {
      method: "POST",
      body: {
        title: post.title,
        content: post.content,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return blockSchema.parse(data);
  } catch (error) {
    console.error(error);
    return null;
  }
};
