import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Footer Component
 * Footer with links and information
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-slate-900 text-white mt-16 border-t border-slate-700" role="contentinfo">
      <div class="container mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 class="font-bold mb-4">About</h3>
            <ul class="space-y-2">
              <li><a routerLink="/blog/about" class="hover:text-yellow-400 transition">About Us</a></li>
              <li><a routerLink="/blog/contact" class="hover:text-yellow-400 transition">Contact</a></li>
              <li><a routerLink="/blog/contribute" class="hover:text-yellow-400 transition">Contribute</a></li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold mb-4">Resources</h3>
            <ul class="space-y-2">
              <li><a routerLink="/blog" class="hover:text-yellow-400 transition">Blog</a></li>
              <li><a href="#" class="hover:text-yellow-400 transition">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold mb-4">Legal</h3>
            <ul class="space-y-2">
              <li><a href="#" class="hover:text-yellow-400 transition">Privacy Policy</a></li>
              <li><a href="#" class="hover:text-yellow-400 transition">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold mb-4">Follow Us</h3>
            <ul class="space-y-2">
              <li><a href="#" class="hover:text-yellow-400 transition">Twitter</a></li>
              <li><a href="#" class="hover:text-yellow-400 transition">Facebook</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-slate-700 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Book Review Blog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {}

