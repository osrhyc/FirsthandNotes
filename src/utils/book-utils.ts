import { getCollection } from "astro:content";
import { getBookNoteUrl } from "@utils/url-utils";

export interface BookChapter {
	number: number;
	slug: string;
	title: string;
	noteId: string;
	updatedAt: string;
	url: string;
}

export interface BookRecord {
	slug: string;
	title: string;
	author: string;
	description: string;
	category: string;
	sequence: number;
	updatedAt: string;
	chapters: BookChapter[];
}

let booksPromise: Promise<BookRecord[]> | undefined;

function dateOnly(date: Date) {
	return date.toISOString().slice(0, 10);
}

export async function getBooks(): Promise<BookRecord[]> {
	booksPromise ??= Promise.all([
		getCollection("books"),
		getCollection("bookNotes", ({ data }) =>
			import.meta.env.PROD ? data.draft !== true : true,
		),
	]).then(([bookEntries, noteEntries]) => {
		const notesByBook = new Map<string, BookChapter[]>();

		for (const note of noteEntries) {
			const bookId = note.data.book.id;
			const noteSlug = note.id.startsWith(`${bookId}--`)
				? note.id.slice(bookId.length + 2)
				: String(note.data.chapter);
			const chapter = {
				number: note.data.chapter,
				slug: noteSlug,
				title: note.data.title,
				noteId: note.id,
				updatedAt: dateOnly(note.data.updated),
				url: getBookNoteUrl(bookId, noteSlug),
			};
			const chapters = notesByBook.get(bookId) || [];
			chapters.push(chapter);
			notesByBook.set(bookId, chapters);
		}

		return bookEntries
			.map((book) => ({
				slug: book.id,
				title: book.data.title,
				author: book.data.author,
				description: book.data.description,
				category: book.data.category,
				sequence: book.data.sequence,
				updatedAt: dateOnly(book.data.updated),
				chapters: (notesByBook.get(book.id) || []).sort(
					(a, b) => a.number - b.number || a.title.localeCompare(b.title),
				),
			}))
			.sort(
				(a, b) =>
					a.sequence - b.sequence ||
					a.title.localeCompare(b.title, "zh-CN"),
			);
	});

	return booksPromise;
}
