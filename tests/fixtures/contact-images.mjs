// Complete 1×1 images, encoded once with sharp; valid files rather than signature stubs.
export const jpeg = Buffer.from('/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABgf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCgA6qv/9k=', 'base64');
export const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADElEQVQImWN4EasFAAOgAXC44hT/AAAAAElFTkSuQmCC', 'base64');
export const webp = Buffer.from('UklGRjoAAABXRUJQVlA4IC4AAADwAQCdASoBAAEAAUAmJaACdLoB+AAEyAAAm//PzO7cX9Vv/tof1of1of9kAAAA', 'base64');
export const gif = Buffer.from('GIF89a');
export const pdf = Buffer.from('%PDF-1.7');
export const executable = Buffer.from([0x4d, 0x5a, 0x90, 0x00]);
export const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
export const unknown = Buffer.from([0x01, 0x02, 0x03, 0x04]);
