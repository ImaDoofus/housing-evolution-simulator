<script>
	// @ts-nocheck

	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
	let canvas;
	let innerWidth;
	let innerHeight;

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
	camera.position.set(0, 0, 10);

	const geometry = new THREE.BoxGeometry();
	const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
	let renderer;
	let controls;

	for (let x = 0; x < 20; x++) {
		for (let y = 0; y < 20; y++) {
			const height = Math.random() * 10;
			const cube = new THREE.Mesh(geometry, material);
			cube.position.set(x, height, y);
			scene.add(cube);
		}
	}

	// lights
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
	scene.add(ambientLight);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
	directionalLight.position.set(10, 10, 10);
	scene.add(directionalLight);

	const animate = () => {
		requestAnimationFrame(animate);

		renderer.render(scene, camera);
	};

	const resize = () => {
		// resize to parent container
		renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();
	};

	onMount(() => {
		renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
		controls = new OrbitControls(camera, renderer.domElement);
		controls.update();
		resize();
		animate();
	});
</script>

<svelte:window on:resize={resize} bind:innerWidth bind:innerHeight />
<canvas bind:this={canvas} class="w-full h-full" />
