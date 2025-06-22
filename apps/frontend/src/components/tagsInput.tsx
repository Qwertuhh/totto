import React, { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface TagInputProps {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
}

const TagInput: React.FC<TagInputProps> = ({ tags, setTags }) => {
  const [inputValue, setInputValue] = useState<string>("");

  const addTags = (newTags: string[]) => {
    //? Filter out empty tags and duplicates (case-insensitive)
    const normalizedTags = newTags
      .map((tag) => tag.trim().toLowerCase())
      .filter(
        (tag) => tag !== "" && !tags.map((t) => t.toLowerCase()).includes(tag)
      );

    //? Preserve original case for display
    const uniqueTags = newTags.filter(
      (tag, index) =>
        tag.trim() !== "" && normalizedTags[index] === tag.trim().toLowerCase()
    );

    setTags([...tags, ...uniqueTags]);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue.trim() !== "") {
      //? Split input by commas and add valid tags
      const newTags = inputValue.split(",").map((tag) => tag.trim());
      addTags(newTags);
      setInputValue("");
      event.preventDefault(); //? Prevent form submission if inside a form
    } else if (
      event.key === "Backspace" &&
      inputValue === "" &&
      tags.length > 0
    ) {
      //? Remove last tag if Backspace is pressed and input is empty
      setTags(tags.slice(0, -1));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge
            key={`${tag}-${index}`} // Use tag and index for unique key
            className="flex items-center gap-1 pr-1"
          >
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 rounded-full p-1 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:bg-zinc-900"
              aria-label={`Remove ${tag} tag`}
            >
              <X size={14} />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        type="text"
        placeholder="Add tags..."
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
      />
    </div>
  );
};

export default TagInput;
