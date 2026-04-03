import React, { useEffect, useRef, useState } from "react";
import { Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

export default function EmojiPickerButton({ onSelect }) {
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef(null);
	const panelRef = useRef(null);

	useEffect(() => {
		if (!isOpen) return undefined;

		const handleClickOutside = (event) => {
			const target = event.target;
			if (buttonRef.current?.contains(target)) return;
			if (panelRef.current?.contains(target)) return;
			setIsOpen(false);
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	return (
		<div className="relative">
			<button
				ref={buttonRef}
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className="w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-[#1e2633] text-slate-400 inline-flex items-center justify-center"
				aria-label="Emoji"
			>
				<Smile className="w-4 h-4 md:w-5 md:h-5" />
			</button>

			{isOpen ? (
				<div
					ref={panelRef}
					className="absolute bottom-12 left-0 z-30 w-[280px] max-w-[85vw] sm:w-[320px] rounded-2xl border border-[#2a3140] bg-[#0f131b] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
				>
					<EmojiPicker
						theme="dark"
						height={360}
						width="100%"
						previewConfig={{ showPreview: false }}
						skinTonesDisabled
						lazyLoadEmojis
						onEmojiClick={(emojiData) => {
							onSelect?.(emojiData.emoji || "");
							setIsOpen(false);
						}}
					/>
				</div>
			) : null}
		</div>
	);
}
